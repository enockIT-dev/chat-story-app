const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const http = require("http")
const path = require("path")
const { Server } = require("socket.io")
const cookieParser = require("cookie-parser")

dotenv.config()

require("./config/db")

const setupSocket = require("./config/socket")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messageRoutes")
const storyRoutes = require("./routes/storyRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

setupSocket(io)
app.set("io", io)

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === clientUrl || origin === "http://localhost:5173") {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.get("/", (req, res) => {
  res.send("API Running")
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/stories", storyRoutes)
app.use("/api/notifications", notificationRoutes)

app.get("/api/online-users", (req, res) => {
  const db = require("./config/db")

  // Return currently-online users + last active time for relative "x hours ago"
  // We keep this simple and only expose recent last_active_at values.
  const hoursBack = Math.min(parseInt(req.query.hoursBack || 24), 72)

  db.query(
    `SELECT
        u.id as user_id,
        u.name,
        u.avatar,
        u.email,
        u.last_active_at,
        CASE WHEN ou.user_id IS NOT NULL THEN 1 ELSE 0 END as is_online
     FROM users u
     LEFT JOIN online_users ou ON ou.user_id = u.id
     WHERE u.last_active_at IS NOT NULL
       AND u.last_active_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     ORDER BY is_online DESC, u.last_active_at DESC`,
    [hoursBack],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
})


const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`)
})
