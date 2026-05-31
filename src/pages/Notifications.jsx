import { useEffect, useState } from "react"
import { FiBell, FiCheck } from "react-icons/fi"
import toast from "react-hot-toast"
import API from "../api/axios"
import Navbar from "../components/Navbar"

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications")
      setNotifications(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      )
    } catch (err) {
      toast.error("Failed to mark as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all")
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
      toast.success("All marked as read")
    } catch (err) {
      toast.error("Failed to update notifications")
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️"
      case "comment":
        return "💬"
      case "follow":
        return "👤"
      case "message":
        return "✉️"
      default:
        return "🔔"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              <FiCheck size={16} />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiBell size={48} className="mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  n.is_read
                    ? "bg-slate-800 border-slate-700"
                    : "bg-slate-800 border-indigo-500/50"
                }`}
              >
                <span className="text-2xl">{getIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{n.message}</p>
                  {n.from_user_name && (
                    <p className="text-xs text-slate-400 mt-0.5">from {n.from_user_name}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-2 text-slate-400 hover:text-indigo-400 shrink-0"
                    title="Mark as read"
                  >
                    <FiCheck size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Notifications
