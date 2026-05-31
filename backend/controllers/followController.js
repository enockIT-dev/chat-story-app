const db = require("../config/db")

const isFollowingUser = (req, res) => {
  const followerId = req.user.id
  const followingId = req.params.id

  if (parseInt(followingId) === followerId) {
    return res.json({ isFollowing: false })
  }

  db.query(
    "SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ? LIMIT 1",
    [followerId, followingId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ isFollowing: results.length > 0 })
    }
  )
}

const getFollowersCount = (req, res) => {
  const targetUserId = req.params.id
  db.query(
    "SELECT COUNT(*) AS followersCount FROM followers WHERE following_id = ?",
    [targetUserId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ followersCount: results?.[0]?.followersCount || 0 })
    }
  )
}

const getFollowingCount = (req, res) => {
  const targetUserId = req.params.id
  db.query(
    "SELECT COUNT(*) AS followingCount FROM followers WHERE follower_id = ?",
    [targetUserId],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ followingCount: results?.[0]?.followingCount || 0 })
    }
  )
}

const getFollowers = (req, res) => {
  const targetUserId = req.params.id
  const limit = Math.min(parseInt(req.query.limit || 50), 200)

  db.query(
    `SELECT u.id, u.name, u.email, u.avatar, u.bio, u.created_at
     FROM followers f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = ?
     ORDER BY f.created_at DESC
     LIMIT ?`,
    [targetUserId, limit],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

const getFollowing = (req, res) => {
  const targetUserId = req.params.id
  const limit = Math.min(parseInt(req.query.limit || 50), 200)

  db.query(
    `SELECT u.id, u.name, u.email, u.avatar, u.bio, u.created_at
     FROM followers f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = ?
     ORDER BY f.created_at DESC
     LIMIT ?`,
    [targetUserId, limit],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
}

module.exports = {
  isFollowingUser,
  getFollowersCount,
  getFollowingCount,
  getFollowers,
  getFollowing,
}

