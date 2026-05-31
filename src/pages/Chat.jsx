import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import ChatBox from "../components/ChatBox"

const Chat = () => {
  const { conversationId } = useParams()
  const [selectedUser, setSelectedUser] = useState(null)
  const navigate = useNavigate()

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    navigate("/chat", { replace: false })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onSelectUser={handleSelectUser} />
        <ChatBox conversationId={conversationId} selectedUser={selectedUser} />
      </div>
    </div>
  )
}

export default Chat

