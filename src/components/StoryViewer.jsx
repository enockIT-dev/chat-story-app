import { useEffect, useState } from "react"
import { FiX, FiHeart, FiSend } from "react-icons/fi"
import API from "../api/axios"
const StoryViewer = ({ story, onClose, onLike }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    if (story) fetchComments()
  }, [story])

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/stories/${story.id}/comments`)
      setComments(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await API.post(`/stories/${story.id}/comment`, { content: newComment })
      setNewComment("")
      fetchComments()
    } catch (err) {
      console.error(err)
    }
  }

  if (!story) return null

  const imageUrl = story.image?.startsWith("http")
    ? story.image
    : `http://localhost:5000${story.image}`

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <p className="font-semibold text-white">{story.user_name}</p>
            <p className="text-xs text-slate-400">
              {new Date(story.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <img src={imageUrl} alt={story.caption} className="w-full max-h-80 object-contain bg-black" />

        {story.caption && (
          <p className="px-4 py-2 text-slate-300">{story.caption}</p>
        )}

        <div className="px-4 py-2 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => onLike?.(story.id)}
            className={`flex items-center gap-1 ${
              story.liked_by_me ? "text-red-400" : "text-slate-400"
            }`}
          >
            <FiHeart fill={story.liked_by_me ? "currentColor" : "none"} />
            {story.likes_count || 0}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white shrink-0">
                {c.user_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{c.user_name}</p>
                <p className="text-sm text-slate-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleComment} className="p-4 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl"
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default StoryViewer
