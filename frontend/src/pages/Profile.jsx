import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { useNavigate, useParams } from "react-router-dom"
import StoryViewer from "../components/StoryViewer"
// (no extra navigation needed yet)

const Profile = () => {
  const { user, updateUser } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()


  const viewingUserId = id ? parseInt(id) : user?.id
  const isSelf = !!user?.id && viewingUserId === user.id

  const [profile, setProfile] = useState(user || null)
  const [name, setName] = useState(user?.name || "")
  const [bio, setBio] = useState(user?.bio || "")

  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [followers, setFollowers] = useState([])

  const [activeStories, setActiveStories] = useState([])
  const [viewingStory, setViewingStory] = useState(null)

  const getAvatarSrc = (avatar) => {
    if (!avatar) return null
    return avatar.startsWith("http") ? avatar : `http://localhost:5000${avatar}`
  }

  const getHasActiveStories = useMemo(() => {
    return (activeStories?.length || 0) > 0
  }, [activeStories])

  useEffect(() => {
    let alive = true

    const loadPublicProfile = async () => {
      if (!viewingUserId) return

      try {
        const [profileRes, followersCountRes, followingCountRes] = await Promise.all([
          API.get(`/users/${viewingUserId}`),
          API.get(`/users/${viewingUserId}/followers-count`),
          API.get(`/users/${viewingUserId}/following-count`),
        ])

        if (!alive) return
        setProfile(profileRes.data)
        setFollowersCount(followersCountRes.data.followersCount || 0)
        setFollowingCount(followingCountRes.data.followingCount || 0)

        // load a small list of followers
        const followersRes = await API.get(`/users/${viewingUserId}/followers?limit=12`)
        if (!alive) return
        setFollowers(followersRes.data || [])
      } catch (err) {
        console.error(err)
      }
    }

    const loadActiveStories = async () => {
      try {
        const res = await API.get(`/stories/user/${viewingUserId}`)
        if (!alive) return
        setActiveStories(res.data || [])
      } catch (err) {
        console.error(err)
      }
    }

    loadPublicProfile()
    loadActiveStories()

    return () => {
      alive = false
    }
  }, [viewingUserId])

  useEffect(() => {
    if (!isSelf) return
    setName(user?.name || "")
    setBio(user?.bio || "")
  }, [isSelf, user?.name, user?.bio])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { data } = await API.put(`/users/${user.id}`, { name, bio })
      updateUser(data)
      toast.success("Profile updated!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const { data } = await API.put(`/users/${user.id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      updateUser(data)
      toast.success("Profile picture updated!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed")
    } finally {
      setAvatarUploading(false)
    }
  }



  const handleOpenStoryRing = () => {
    if (!activeStories?.length) return
    setViewingStory(activeStories[0])
  }

  const handleLikeStoryFromProfile = async (storyId) => {
    try {
      await API.post(`/stories/${storyId}/like`)
      // refresh
      const res = await API.get(`/stories/user/${viewingUserId}`)
      setActiveStories(res.data || [])
      // update viewing story liked state quickly if we have it
      setViewingStory((prev) => {
        if (!prev || prev.id !== storyId) return prev
        return { ...prev }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to like")
    }
  }

  // Follow/unfollow when viewing someone else
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    let alive = true
    const run = async () => {
      if (!user || isSelf) return
      try {
        const { data } = await API.get(`/users/${viewingUserId}/follow-status`)
        if (!alive) return
        setIsFollowing(!!data?.isFollowing)
      } catch (e) {
        // ignore
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [user, isSelf, viewingUserId])

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Login to follow")
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await API.delete(`/users/${viewingUserId}/follow`)
        setIsFollowing(false)
      } else {
        await API.post(`/users/${viewingUserId}/follow`)
        setIsFollowing(true)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Follow action failed")
    } finally {
      setFollowLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        <div className={`bg-slate-800 border border-slate-700 rounded-xl p-8 ${profile?.theme === "midnight" ? "bg-slate-950" : ""}`}>
          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl text-white font-bold mb-4 overflow-hidden transition-all ${
                getHasActiveStories ? "ring-4 ring-pink-500 cursor-pointer" : ""
              }`}

              title={getHasActiveStories ? "Has stories" : "No stories"}
              onClick={getHasActiveStories ? handleOpenStoryRing : undefined}
            >
              {getAvatarSrc(profile?.avatar) ? (
                <img
                  src={getAvatarSrc(profile?.avatar)}
                  alt={profile?.name}
                  className="w-24 h-24 object-cover"
                />
              ) : (
                profile?.name?.charAt(0)?.toUpperCase()
              )}
            </div>

            <h2 className="text-xl font-semibold text-white inline-flex items-center gap-2">
              {profile?.name}
              {profile?.hasBlueTick && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold leading-none">
                  ✓
                </span>
              )}
            </h2>
            <p className="text-slate-400">{profile?.email}</p>


            {!isSelf && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors flex-1 ${
                    isFollowing
                      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  } disabled:opacity-60`}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (!user || !viewingUserId) return

                    try {
                      // Ensure conversation exists by creating/attaching via message endpoint
                      // Backend requires content; send harmless placeholder.
                      await API.post("/messages/", {
                        receiverId: viewingUserId,
                        content: " ",
                      })
                      // Remove placeholder message (we don't want it to appear in chat)
                      await API.post("/messages/", {
                        conversationId: null,
                        receiverId: viewingUserId,
                        content: "",
                      }).catch(() => {})

                      const { data } = await API.get("/messages/conversations")
                      const conv = Array.isArray(data)
                        ? data.find((c) => {
                            const otherId = c.other_user_id ?? c.other_userId;
                            return String(otherId) === String(viewingUserId)
                          })
                        : null


                      if (!conv?.id) {
                        toast.error("Could not open chat")
                        return
                      }

                      navigate(`/chat/${conv.id}`)
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Failed to start chat")
                    }
                  }}
                  className="px-4 py-2 rounded-xl font-medium bg-slate-900 border border-slate-600 text-slate-100 hover:bg-slate-800 hover:border-indigo-500 transition-colors flex-1"
                >
                  Message
                </button>
              </div>
            )}

          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Followers</p>
              <p className="text-white text-xl font-bold">{followersCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Following</p>
              <p className="text-white text-xl font-bold">{followingCount}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Recent followers</h3>
            {followers.length === 0 ? (
              <p className="text-slate-400 text-sm">No followers yet.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {followers.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                    <img
                      src={getAvatarSrc(f.avatar) || undefined}
                      alt={f.name}
                      className="w-8 h-8 rounded-full object-cover bg-indigo-600"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{f.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isSelf && (
            <>
              <div className="mb-6">
                <label className="block text-sm text-slate-300 mb-1.5">Theme</label>
                <select
                  value={profile?.theme || "default"}
                  onChange={async (e) => {
                    const theme = e.target.value
                    try {
                      await API.put(`/users/${user.id}`, { theme })
                      // refresh local profile theme (server returns updated user)
                      setProfile((prev) => (prev ? { ...prev, theme } : prev))
                    } catch (err) {
                      toast.error(err.response?.data?.message || "Theme update failed")
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="default">Default</option>
                  <option value="midnight">Midnight</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate-300 mb-1.5">Profile picture</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                  className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 mt-2">Upload an image from your device.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                {avatarUploading && (
                  <div className="text-center text-sm text-indigo-200">Uploading profile picture...</div>
                )}
              </form>
            </>
          )}
        </div>
      </main>

      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
          onLike={(sid) => handleLikeStoryFromProfile(sid)}
        />
      )}
    </div>
  )
}

export default Profile


