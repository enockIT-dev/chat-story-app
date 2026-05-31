const bcrypt = require("bcryptjs")
const db = require("../config/db")
const generateToken = require("../utils/generateToken")

const register = (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" })
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message })
    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (insertErr, insertResult) => {
        if (insertErr) return res.status(500).json({ message: insertErr.message })

        const userId = insertResult.insertId
        res.status(201).json({
          id: userId,
          name,
          email,
          token: generateToken(userId),
        })
      }
    )
  })
}

const login = (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill all fields" })
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message })
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = results[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      token: generateToken(user.id),
    })
  })
}

const getMe = (req, res) => {
  db.query(
    "SELECT id, name, email, avatar, bio, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }
      res.json(results[0])
    }
  )
}

module.exports = { register, login, getMe }
