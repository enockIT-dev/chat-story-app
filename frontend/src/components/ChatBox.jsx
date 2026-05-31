import { useEffect, useState, useRef } from "react"
import { FiSend } from "react-icons/fi"
import API from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"
import MessageBubble from "./MessageBubble"

const ChatBox = ({ conversationId, selectedUser }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { user } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  useEffect(() => {
    if (!socket) return

    const handleReceive = (data) => {
      if (
        data.conversation_id === parseInt(conversationId) ||
        data.conversationId === parseInt(conversationId)
      ) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev
          return [...prev, data]
        })
      }
    }

    socket.on("receiveMessage", handleReceive)
    return () => socket.off("receiveMessage", handleReceive)
  }, [socket, conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data } = await API.get(`/messages/${conversationId}`)
      setMessages(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage("")

    try {
      const payload = conversationId
        ? { conversationId, content }
        : { receiverId: selectedUser?.id, content }

      const { data } = await API.post("/messages", payload)

      const messageData = {
        ...data,
        sender_id: user.id,
        sender_name: user.name,
        conversation_id: data.conversation_id || conversationId,
      }

      setMessages((prev) => [...prev, messageData])

      socket?.emit("sendMessage", messageData)
    } catch (err) {
      console.error(err)
    }
  }

  const chatTitle = selectedUser?.name || "Select a conversation"

  return (
    <div className="flex-1 flex flex-col bg-slate-900 h-full">
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <h3 className="font-semibold text-white">{chatTitle}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !conversationId && !selectedUser ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select a chat or user to start messaging
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id || msg.created_at} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {(conversationId || selectedUser) && (
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
          >
            <FiSend size={20} />
          </button>
        </form>
      )}
    </div>
  )
}

export default ChatBox
