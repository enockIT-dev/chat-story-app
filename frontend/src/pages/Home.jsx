import { Link } from "react-router-dom"
import { FiMessageCircle, FiImage, FiBell, FiUsers } from "react-icons/fi"
import Navbar from "../components/Navbar"
import OnlineUsers from "../components/OnlineUsers"
import { useAuth } from "../context/AuthContext"

const Home = () => {
  const { user } = useAuth()

  const cards = [
    {
      to: "/chat",
      icon: FiMessageCircle,
      title: "Messages",
      desc: "Chat with friends in real-time",
      color: "bg-indigo-600",
    },
    {
      to: "/stories",
      icon: FiImage,
      title: "Stories",
      desc: "Share moments that disappear in 24h",
      color: "bg-pink-600",
    },
    {
      to: "/notifications",
      icon: FiBell,
      title: "Notifications",
      desc: "Stay updated on activity",
      color: "bg-amber-600",
    },
    {
      to: "/profile",
      icon: FiUsers,
      title: "Profile",
      desc: "Manage your account",
      color: "bg-emerald-600",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 mt-1">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ to, icon: Icon, title, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors group"
            >
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400 mt-1">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white">1</span>
                Go to Chat and select a user to start a conversation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white">2</span>
                Upload a story with an image and caption
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white">3</span>
                Like and comment on your friends' stories
              </li>
            </ul>
          </div>
          <OnlineUsers />
        </div>
      </main>
    </div>
  )
}

export default Home
