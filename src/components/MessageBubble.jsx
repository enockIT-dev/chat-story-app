import { useAuth } from "../context/AuthContext"

const MessageBubble = ({ message }) => {
  const { user } = useAuth()
  const isOwn = message.sender_id === user?.id

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl ${
          isOwn
            ? "bg-indigo-600 text-white rounded-br-md"
            : "bg-slate-700 text-slate-100 rounded-bl-md"
        }`}
      >
        {!isOwn && message.sender_name && (
          <p className="text-xs text-indigo-300 mb-1 font-medium">{message.sender_name}</p>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? "text-indigo-200" : "text-slate-400"}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

export default MessageBubble
