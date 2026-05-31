import { Link, useLocation } from "react-router-dom"
import {
  FiHome,
  FiMessageCircle,
  FiImage,
  FiBell,
  FiUser,
  FiLogOut,
  FiUsers,
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links = [
    { to: "/", icon: FiHome, label: "Home" },
    { to: "/chat", icon: FiMessageCircle, label: "Chat" },
    { to: "/stories", icon: FiImage, label: "Stories" },
    { to: "/people", icon: FiUsers, label: "People" },
    { to: "/notifications", icon: FiBell, label: "Alerts" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ]

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-400 tracking-tight">
          ChatStory
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive =
              location.pathname === to ||
              (to !== "/" && location.pathname.startsWith(to))

            return (
              <Link
                key={to}
                to={to}
                className={`btn ${isActive ? "btn-primary" : "btn-ghost"} px-4 py-2`}
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">{user?.name}</span>
          <button
            onClick={logout}
            className="btn btn-ghost p-2 w-10 h-10"
            title="Logout"
          >
            <FiLogOut size={18} />
          </button>

        </div>
      </div>

      <div className="md:hidden flex justify-around mt-3 pt-3 border-t border-slate-700">
        {links.map(({ to, icon: Icon }) => {
          const isActive =
            location.pathname === to ||
            (to !== "/" && location.pathname.startsWith(to))

          return (
            <Link
              key={to}
              to={to}
              className={`btn ${isActive ? "btn-primary" : "btn-ghost"} px-3 py-2`}
            >
              <Icon size={22} />
            </Link>
          )
        })}
      </div>

    </nav>
  )
}

export default Navbar
