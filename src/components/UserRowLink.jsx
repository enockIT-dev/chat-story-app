import { useMemo } from "react"

const UserRowLink = ({ user, onClick }) => {
  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return null
    return user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`
  }, [user?.avatar])

  return (
    <button
      type="button"
      onClick={() => onClick?.(user)}
      className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-700 transition-colors"
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      )}

        <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate inline-flex items-center gap-2">
          {user?.name}
          {user?.hasBlueTick && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] font-bold leading-none">
              ✓
            </span>
          )}
        </p>
        <p className="text-sm text-slate-400 truncate">{user?.email}</p>
      </div>

    </button>
  )
}

export default UserRowLink

