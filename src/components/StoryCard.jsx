import { FiHeart, FiMessageCircle, FiTrash2 } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const StoryCard = ({ story, onView, onLike, onDelete }) => {
  const { user } = useAuth()
  const isOwner = story.user_id === user?.id

  const imageUrl = story.image?.startsWith("http")
    ? story.image
    : `http://localhost:5000${story.image}`

  const getAvatar = () => {
    if (story.user_avatar) {
      return (
        <img
          src={
            story.user_avatar.startsWith("http")
              ? story.user_avatar
              : `http://localhost:5000${story.user_avatar}`
          }
          alt={story.user_name}
          className="w-8 h-8 rounded-full object-cover"
        />
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
        {story.user_name?.charAt(0)?.toUpperCase()}
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center gap-2 p-3">
        {getAvatar()}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{story.user_name}</p>
          <p className="text-xs text-slate-400">
            {new Date(story.created_at).toLocaleString()}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete?.(story.id)}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      <button onClick={() => onView?.(story)} className="w-full block">
        <img src={imageUrl} alt={story.caption || "Story"} className="w-full h-64 object-cover" />
      </button>

      {story.caption && (
        <p className="px-3 py-2 text-sm text-slate-300">{story.caption}</p>
      )}

      <div className="flex items-center gap-4 px-3 py-3 border-t border-slate-700">
        <button
          onClick={() => onLike?.(story.id)}
          className={`flex items-center gap-1 text-sm ${
            story.liked_by_me ? "text-red-400" : "text-slate-400 hover:text-red-400"
          }`}
        >
          <FiHeart size={18} fill={story.liked_by_me ? "currentColor" : "none"} />
          {story.likes_count || 0}
        </button>
        <button
          onClick={() => onView?.(story)}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-400"
        >
          <FiMessageCircle size={18} />
          {story.comments_count || 0}
        </button>
      </div>
    </div>
  )
}

export default StoryCard
