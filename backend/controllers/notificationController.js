const db = require("../config/db")

const getNotifications = (req, res) => {
  db.query(
    `SELECT n.*, u.name as from_user_name, u.avatar as from_user_avatar
     FROM notifications n
     LEFT JOIN users u ON n.from_user_id = u.id
     WHERE n.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

const markAsRead = (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message })
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Notification not found" })
      }
      res.json({ message: "Marked as read" })
    }
  )
}

const markAllAsRead = (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ message: "All notifications marked as read" })
    }
  )
}

const createNotification = (userId, fromUserId, type, message, referenceId = null) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO notifications (user_id, from_user_id, type, message, reference_id) VALUES (?, ?, ?, ?, ?)",
      [userId, fromUserId, type, message, referenceId],
      (err, result) => {
        if (err) reject(err)
        else resolve(result.insertId)
      }
    )
  })
}

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification }
