import { useEffect, useState, useRef } from "react"
import { FiPlus, FiUpload } from "react-icons/fi"
import toast from "react-hot-toast"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import StoryCard from "../components/StoryCard"
import StoryViewer from "../components/StoryViewer"

const Stories = () => {
  const [stories, setStories] = useState([])
  const [viewingStory, setViewingStory] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const { data } = await API.get("/stories")
      setStories(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!image) {
      toast.error("Please select an image")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("image", image)
    formData.append("caption", caption)

    try {
      await API.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Story uploaded!")
      setShowUpload(false)
      setCaption("")
      setImage(null)
      fetchStories()
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (storyId) => {
    try {
      await API.post(`/stories/${storyId}/like`)
      fetchStories()
      if (viewingStory?.id === storyId) {
        setViewingStory((prev) => ({
          ...prev,
          liked_by_me: true,
          likes_count: (prev.likes_count || 0) + 1,
        }))
      }
    } catch (err) {
      if (err.response?.status !== 400) {
        toast.error("Failed to like story")
      }
    }
  }

  const handleDelete = async (storyId) => {
    if (!confirm("Delete this story?")) return
    try {
      await API.delete(`/stories/${storyId}`)
      toast.success("Story deleted")
      fetchStories()
    } catch (err) {
      toast.error("Failed to delete story")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Stories</h1>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus size={18} />
            Add Story
          </button>
        </div>

        {showUpload && (
          <form
            onSubmit={handleUpload}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6 space-y-4"
          >
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
            >
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
              ) : (
                <div className="text-slate-400">
                  <FiUpload size={32} className="mx-auto mb-2" />
                  <p>Click to select an image</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium"
            >
              {uploading ? "Uploading..." : "Post Story"}
            </button>
          </form>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FiUpload size={48} className="mx-auto mb-4 opacity-50" />
            <p>No stories yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onView={setViewingStory}
                onLike={handleLike}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
          onLike={handleLike}
        />
      )}
    </div>
  )
}

export default Stories
