const db = require("../config/db")

const createMessage = (req, res) => {
  const { conversationId, content, receiverId } = req.body
  const senderId = req.user.id

  if (!content) {
    return res.status(400).json({ message: "Message content required" })
  }

  const saveMessage = (convId) => {
    db.query(
      "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
      [convId, senderId, content],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message })

        const message = {
          id: result.insertId,
          conversation_id: convId,
          sender_id: senderId,
          content,
          created_at: new Date(),
        }

        res.status(201).json(message)
      }
    )
  }

  if (conversationId) {
    saveMessage(conversationId)
  } else if (receiverId) {
    db.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
       WHERE (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) = 2
       LIMIT 1`,
      [senderId, receiverId],
      (err, results) => {
        if (err) return res.status(500).json({ message: err.message })

        if (results.length > 0) {
          saveMessage(results[0].id)
        } else {
          db.query(
            "INSERT INTO conversations () VALUES ()",
            [],
            (convErr, convResult) => {
              if (convErr) return res.status(500).json({ message: convErr.message })

              const newConvId = convResult.insertId
              db.query(
                "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
                [newConvId, senderId, newConvId, receiverId],
                (partErr) => {
                  if (partErr) return res.status(500).json({ message: partErr.message })
                  saveMessage(newConvId)
                }
              )
            }
          )
        }
      }
    )
  } else {
    res.status(400).json({ message: "conversationId or receiverId required" })
  }
}

const getMessages = (req, res) => {
  const { conversationId } = req.params

  db.query(
    `SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    [conversationId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

const getConversations = (req, res) => {
  db.query(
    `SELECT c.id, c.created_at,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
      (SELECT u.id FROM users u
       JOIN conversation_participants cp ON u.id = cp.user_id
       WHERE cp.conversation_id = c.id AND cp.user_id != ? LIMIT 1) as other_user_id,
      (SELECT u.name FROM users u
       JOIN conversation_participants cp ON u.id = cp.user_id
       WHERE cp.conversation_id = c.id AND cp.user_id != ? LIMIT 1) as other_user_name,
      (SELECT u.avatar FROM users u
       JOIN conversation_participants cp ON u.id = cp.user_id
       WHERE cp.conversation_id = c.id AND cp.user_id != ? LIMIT 1) as other_user_avatar
     FROM conversations c
     JOIN conversation_participants cp ON c.id = cp.conversation_id
     WHERE cp.user_id = ?
     ORDER BY last_message_at DESC`,
    [req.user.id, req.user.id, req.user.id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

module.exports = { createMessage, getMessages, getConversations }
