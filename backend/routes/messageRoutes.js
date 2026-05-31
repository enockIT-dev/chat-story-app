const express = require("express")
const {
  createMessage,
  getMessages,
  getConversations,
} = require("../controllers/messageController")
const { protect } = require("../middleware/authMiddleware")

const router = express.Router()

router.get("/conversations", protect, getConversations)
router.post("/", protect, createMessage)
router.get("/:conversationId", protect, getMessages)

module.exports = router
