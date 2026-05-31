const db = require("../config/db")

const getUsers = (req, res) => {
  db.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.avatar,
       u.bio,
       u.created_at,
       COALESCE(f.followersCount, 0) AS followersCount,
       CASE WHEN COALESCE(f.followersCount, 0) > 10 THEN 1 ELSE 0 END AS hasBlueTick,
       COALESCE(f.followersCount, 0) > 10 AS _hasBlueTick_bool
     FROM users u
     LEFT JOIN (
       SELECT following_id, COUNT(*) AS followersCount
       FROM followers
       GROUP BY following_id
     ) f ON f.following_id = u.id
     WHERE u.id != ?`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(
        (results || []).map((r) => ({
          ...r,
          hasBlueTick: !!r.hasBlueTick,
        }))
      )
    }
  )
}

const getUserById = (req, res) => {
  db.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.avatar,
       u.bio,
       u.created_at,
       COALESCE(f.followersCount, 0) AS followersCount,
       CASE WHEN COALESCE(f.followersCount, 0) > 10 THEN 1 ELSE 0 END AS hasBlueTick
     FROM users u
     LEFT JOIN (
       SELECT following_id, COUNT(*) AS followersCount
       FROM followers
       GROUP BY following_id
     ) f ON f.following_id = u.id
     WHERE u.id = ?`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }
      const user = results[0]
      user.hasBlueTick = !!user.hasBlueTick
      res.json(user)
    }
  )
}

const updateUser = (req, res) => {
  const { name, bio, avatar, theme } = req.body
  const userId = req.params.id


  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" })
  }

  db.query(
    "UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), avatar = COALESCE(?, avatar), theme = COALESCE(?, theme) WHERE id = ?",
    [name, bio, avatar, theme, userId],
    (err) => {
      if (err) return res.status(500).json({ message: err.message })

      db.query(
        "SELECT id, name, email, avatar, bio, theme FROM users WHERE id = ?",
        [userId],
        (selectErr, results) => {
          if (selectErr) return res.status(500).json({ message: selectErr.message })
          res.json(results[0])
        }
      )
    }
  )
}


const followUser = (req, res) => {
  const followerId = req.user.id
  const followingId = req.params.id

  if (parseInt(followingId) === followerId) {
    return res.status(400).json({ message: "Cannot follow yourself" })
  }

  db.query(
    "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)",
    [followerId, followingId],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Already following" })
        }
        return res.status(500).json({ message: err.message })
      }
      res.status(201).json({ message: "Followed successfully" })
    }
  )
}

const unfollowUser = (req, res) => {
  db.query(
    "DELETE FROM followers WHERE follower_id = ? AND following_id = ?",
    [req.user.id, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message })
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Not following" })
      }
      res.json({ message: "Unfollowed successfully" })
    }
  )
}

module.exports = { getUsers, getUserById, updateUser, followUser, unfollowUser }
