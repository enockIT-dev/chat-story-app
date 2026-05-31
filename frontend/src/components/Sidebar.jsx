import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import API from "../api/axios"
import UserCard from "./UserCard"
import { useAuth } from "../context/AuthContext"

const Sidebar = ({ onSelectUser }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState("chats")
  const { conversationId } = useParams()

  const [userSearch, setUserSearch] = useState("")

  useEffect(() => {
    fetchConversations()
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchConversations = async () => {
    try {
      const { data } = await API.get("/messages/conversations")
      setConversations(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users")
      setUsers(data)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.trim().toLowerCase()
      if (!q) return true
      return (
        (u?.name || "").toLowerCase().includes(q) ||
        (u?.email || "").toLowerCase().includes(q)
      )
    })
  }, [users, userSearch])

  const getAvatar = (name, avatar) => {
    if (avatar) {
      return (
        <img
          src={avatar.startsWith("http") ? avatar : `http://localhost:5000${avatar}`}
          alt={name}
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    }

    return (
      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
        {name?.charAt(0)?.toUpperCase()}
      </div>
    )
  }

  return (
      <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-full">

      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Messages</h2>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTab("chats")}
            className={`flex-1 py-1.5 text-sm rounded-lg ${
              tab === "chats"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex-1 py-1.5 text-sm rounded-lg ${
              tab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            Users
          </button>
        </div>

        {tab === "users" && (
          <div className="mt-3">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "chats" ? (
          conversations.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-slate-700 transition-colors ${
                  String(conversationId) === String(conv.id) ? "bg-slate-700" : ""
                }`}
              >
                {getAvatar(conv.other_user_name, conv.other_user_avatar)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{conv.other_user_name}</p>
                  <p className="text-sm text-slate-400 truncate">{conv.last_message || "No messages"}</p>
                </div>
              </Link>
            ))
          )
        ) : (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-slate-400 text-sm">No users found</p>
            ) : (
              filteredUsers.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  currentUserId={user?.id}
                  onClick={(userToChat) => onSelectUser?.(userToChat)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar

