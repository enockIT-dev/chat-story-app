import { useEffect, useState } from "react"
import { FiUser, FiLoader } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"

const People = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users")
        if (!alive) return
        setUsers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!alive) return
        setError("Failed to load users")
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    fetchUsers()
    return () => {
      alive = false
    }
  }, [])

  const getAvatarSrc = (avatar) => {
    if (!avatar) return null
    return avatar.startsWith("http") ? avatar : `http://localhost:5000${avatar}`
  }

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`)
  }

  const filteredUsers = users.filter((u) => u.id !== user?.id)

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">People</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-indigo-400 text-2xl" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">No other users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleUserClick(u.id)}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 hover:bg-slate-750 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  {getAvatarSrc(u.avatar) ? (
                    <img
                      src={getAvatarSrc(u.avatar)}
                      alt={u.name}
                      className="w-20 h-20 rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                      <FiUser size={32} />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-white text-center inline-flex items-center justify-center gap-2">
                    {u.name}
                    {u.hasBlueTick && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold leading-none">
                        ✓
                      </span>
                    )}
                  </h3>

                  <p className="text-sm text-slate-400 text-center truncate w-full">{u.email}</p>
                  {u.bio && (
                    <p className="text-sm text-slate-300 text-center mt-2 line-clamp-2">{u.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default People
