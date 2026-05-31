const db = require("./db")

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("setup", (userData) => {
      socket.userId = userData?.userId
      socket.userName = userData?.userName
      socket.join(`user_${userData.userId}`)

      if (userData?.userId) {
        db.query(
          "INSERT INTO online_users (user_id, socket_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE socket_id = ?",
          [userData.userId, socket.id, socket.id],
          () => {}
        )

        // Track last active time
        db.query(
          "UPDATE users SET last_active_at = NOW() WHERE id = ?",
          [userData.userId],
          () => {}
        )
      }

      socket.broadcast.emit("userOnline", {
        userId: userData?.userId,
        userName: userData?.userName,
      })
    })


    socket.on("sendMessage", (data) => {
      io.emit("receiveMessage", {
        ...data,
        created_at: new Date(),
      })
    })

    socket.on("typing", (data) => {
      socket.broadcast.emit("userTyping", data)
    })

    socket.on("stopTyping", (data) => {
      socket.broadcast.emit("userStopTyping", data)
    })

    socket.on("storyViewed", (data) => {
      socket.broadcast.emit("storyViewUpdate", data)
    })

    socket.on("newNotification", (data) => {
      io.to(`user_${data.userId}`).emit("notification", data)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)

      if (socket.userId) {
        // Store last active time on disconnect
        db.query(
          "UPDATE users SET last_active_at = NOW() WHERE id = ?",
          [socket.userId],
          () => {}
        )

        db.query("DELETE FROM online_users WHERE user_id = ?", [socket.userId], () => {})
        socket.broadcast.emit("userOffline", {
          userId: socket.userId,
          userName: socket.userName,
        })
      }

    })
  })
}

module.exports = setupSocket
