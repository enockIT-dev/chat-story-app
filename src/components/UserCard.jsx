import { useEffect, useMemo, useState } from "react"
import { FiUser } from "react-icons/fi"
import API from "../api/axios"

const UserCard = ({ user, currentUserId, onClick }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return null
    return user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`
  }, [user?.avatar])

  useEffect(() => {
    let alive = true
    const fetchStatus = async () => {
      try {
        const { data } = await API.get(`/users/${user.id}/follow-status`)
        if (!alive) return
        setIsFollowing(!!data?.isFollowing)
      } catch (e) {
        // ignore (e.g. not authorized)
      }
    }

    if (user?.id && user.id !== currentUserId) fetchStatus()
    return () => {
      alive = false
    }
  }, [user?.id, currentUserId])

  const toggleFollow = async () => {
    setLoading(true)
    try {
      if (isFollowing) {
        await API.delete(`/users/${user.id}/follow`)
        setIsFollowing(false)
      } else {
        await API.post(`/users/${user.id}/follow`)
        setIsFollowing(true)
      }
    } catch (err) {
      // best-effort feedback
    } finally {
      setLoading(false)
    }
  }

  const canFollow = user?.id && user.id !== currentUserId

  return (
    <div className="flex items-center gap-3 p-4 border border-slate-700 rounded-xl bg-slate-800 hover:border-indigo-500 transition-colors">

      <button
        type="button"
        onClick={() => onClick?.(user)}
        className="flex items-center gap-3 flex-1 text-left"
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <FiUser />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-white truncate inline-flex items-center gap-2">
            {user?.name}
            {user?.hasBlueTick && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold leading-none">✓</span>
            )}
          </p>
          <p className="text-sm text-slate-400 truncate">{user?.email}</p>
        </div>

      </button>

      {canFollow && (
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loading}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isFollowing
              ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
              : "bg-indigo-600 text-white hover:bg-indigo-500"
          } disabled:opacity-60`}
        >
          {loading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  )
}

export default UserCard

