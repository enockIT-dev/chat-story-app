const express = require("express")
const {
  getUsers,
  getUserById,
  updateUser,
  followUser,
  unfollowUser,
} = require("../controllers/userController")
const {
  isFollowingUser,
  getFollowersCount,
  getFollowingCount,
  getFollowers,
  getFollowing,
} = require("../controllers/followController")
const { updateAvatar } = require("../controllers/avatarController")
const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

const router = express.Router()

router.get("/", protect, getUsers)
router.get("/:id", getUserById)
router.put("/:id", protect, updateUser)
router.put("/:id/avatar", protect, upload.single("avatar"), updateAvatar)
router.post("/:id/follow", protect, followUser)
router.delete("/:id/follow", protect, unfollowUser)
router.get("/:id/follow-status", protect, isFollowingUser)

// Public follower/following info (everyone can view)
router.get("/:id/followers-count", getFollowersCount)
router.get("/:id/following-count", getFollowingCount)
router.get("/:id/followers", getFollowers)
router.get("/:id/following", getFollowing)



module.exports = router
