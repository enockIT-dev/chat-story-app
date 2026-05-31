const db = require("../config/db")

const updateAvatar = (req, res) => {
  const userId = req.params.id

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" })
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" })
  }

  const avatar = `/uploads/${req.file.filename}`

  db.query(
    "UPDATE users SET avatar = ? WHERE id = ?",
    [avatar, userId],
    (err) => {
      if (err) return res.status(500).json({ message: err.message })

      db.query(
        "SELECT id, name, email, avatar, bio, created_at FROM users WHERE id = ?",
        [userId],
        (selectErr, results) => {
          if (selectErr) return res.status(500).json({ message: selectErr.message })
          res.json(results[0])
        }
      )
    }
  )
}

module.exports = { updateAvatar }

