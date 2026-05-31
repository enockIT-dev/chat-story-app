import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
    })

    newSocket.on("connect", () => {
      newSocket.emit("setup", { userId: user.id, userName: user.name })
    })

    newSocket.on("userOnline", (data) => {
      setOnlineUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev
        return [...prev, data]
      })
    })

    newSocket.on("userOffline", (data) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}
