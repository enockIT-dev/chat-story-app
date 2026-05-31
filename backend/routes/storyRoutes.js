const express = require("express")
const {
  createStory,
  getStories,
  getUserActiveStories,
  deleteStory,
  likeStory,
  commentOnStory,
  getStoryComments,
} = require("../controllers/storyController")
const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

const router = express.Router()

router.post("/", protect, upload.single("image"), createStory)

// Public: everyone can view all active stories (logged-in viewer can see liked_by_me)
router.get("/", protect, getStories)

// Public: everyone can view stories of a specific user
router.get("/user/:id", getUserActiveStories)

router.delete("/:id", protect, deleteStory)
router.post("/:id/like", protect, likeStory)
router.post("/:id/comment", protect, commentOnStory)
router.get("/:id/comments", protect, getStoryComments)

module.exports = router

