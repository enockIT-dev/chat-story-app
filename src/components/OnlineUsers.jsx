import { useEffect, useState } from "react"
import axios from "axios"
import { useSocket } from "../context/SocketContext"

const OnlineUsers = () => {
  const [users, setUsers] = useState([])
  const { onlineUsers, setOnlineUsers } = useSocket()

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/online-users")
        // data expected: {user_id,name,avatar,email,last_active_at,is_online}
        setUsers(Array.isArray(data) ? data : [])
        setOnlineUsers(
          (Array.isArray(data) ? data : []).map((u) => ({ userId: u.user_id, userName: u.name }))
        )
      } catch (err) {
        console.error(err)
      }
    }

    fetchOnlineUsers()
  }, [setOnlineUsers])


  const formatLastActive = (lastActiveAt) => {
    if (!lastActiveAt) return "";
    const last = new Date(lastActiveAt)
    if (Number.isNaN(last.getTime())) return ""

    const diffMs = Date.now() - last.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours <= 0) return "Active just now"
    if (diffHours === 1) return "1 hour ago"
    return `${diffHours} hours ago`
  }

  const getAvatar = (name, avatar) => {

    if (avatar) {
      return (
        <img
          src={avatar.startsWith("http") ? avatar : `http://localhost:5000${avatar}`}
          alt={name}
          className="w-8 h-8 rounded-full object-cover"
        />
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-semibold">
        {name?.charAt(0)?.toUpperCase()}
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Online ({users.length})
      </h3>
      {users.length === 0 ? (
        <p className="text-slate-500 text-sm">No users recently active</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.user_id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {getAvatar(u.name, u.avatar)}
                <span className="text-sm text-slate-300 truncate">{u.name}</span>
              </div>
              <span className="text-xs text-slate-500 shrink-0">
                {u.is_online === 1 ? "Active now" : formatLastActive(u.last_active_at)}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default OnlineUsers
