const db = require("../config/db")

const createStory = (req, res) => {
  const { caption } = req.body
  const userId = req.user.id

  if (!req.file) {
    return res.status(400).json({ message: "Image required" })
  }

  const image = `/uploads/${req.file.filename}`
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  db.query(
    "INSERT INTO stories (user_id, image, caption, expires_at) VALUES (?, ?, ?, ?)",
    [userId, image, caption || "", expiresAt],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message })

      res.status(201).json({
        id: result.insertId,
        user_id: userId,
        image,
        caption: caption || "",
        expires_at: expiresAt,
      })
    }
  )
}

const getStories = (req, res) => {
  db.query(
    `SELECT s.*, u.name as user_name, u.avatar as user_avatar,
      (SELECT COUNT(*) FROM story_likes WHERE story_id = s.id) as likes_count,
      (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comments_count,
      EXISTS(SELECT 1 FROM story_likes WHERE story_id = s.id AND user_id = ?) as liked_by_me
     FROM stories s
     JOIN users u ON s.user_id = u.id
     WHERE s.expires_at > NOW()
     ORDER BY s.created_at DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

const getUserActiveStories = (req, res) => {
  const targetUserId = req.params.id

  // If not logged in, liked_by_me should be false.
  // The route will be public, so req.user might not exist.
  const viewerId = req.user?.id || null

  db.query(
    `SELECT s.*, u.name as user_name, u.avatar as user_avatar,
      (SELECT COUNT(*) FROM story_likes WHERE story_id = s.id) as likes_count,
      (SELECT COUNT(*) FROM story_comments WHERE story_id = s.id) as comments_count,
      ${viewerId ? `EXISTS(SELECT 1 FROM story_likes WHERE story_id = s.id AND user_id = ${viewerId})` : 'FALSE'} as liked_by_me
     FROM stories s
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = ? AND s.expires_at > NOW()
     ORDER BY s.created_at DESC`,
    [targetUserId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

const deleteStory = (req, res) => {
  db.query(
    "DELETE FROM stories WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message })
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Story not found or unauthorized" })
      }
      res.json({ message: "Story deleted" })
    }
  )
}

const likeStory = (req, res) => {
  db.query(
    "INSERT INTO story_likes (story_id, user_id) VALUES (?, ?)",
    [req.params.id, req.user.id],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Already liked" })
        }
        return res.status(500).json({ message: err.message })
      }
      res.status(201).json({ message: "Story liked" })
    }
  )
}

const commentOnStory = (req, res) => {
  const { content } = req.body
  if (!content) {
    return res.status(400).json({ message: "Comment content required" })
  }

  db.query(
    "INSERT INTO story_comments (story_id, user_id, content) VALUES (?, ?, ?)",
    [req.params.id, req.user.id, content],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message })
      res.status(201).json({
        id: result.insertId,
        story_id: req.params.id,
        user_id: req.user.id,
        content,
      })
    }
  )
}

const getStoryComments = (req, res) => {
  db.query(
    `SELECT sc.*, u.name as user_name, u.avatar as user_avatar
     FROM story_comments sc
     JOIN users u ON sc.user_id = u.id
     WHERE sc.story_id = ?
     ORDER BY sc.created_at ASC`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

module.exports = {
  createStory,
  getStories,
  getUserActiveStories,
  deleteStory,
  likeStory,
  commentOnStory,
  getStoryComments,
}

