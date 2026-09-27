const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
	getMessages,
	sendMessage,
	markRead,
} = require("../controllers/messageController");

const router = express.Router();

router.use(authMiddleware);
router.get("/:conversationId", getMessages);
router.post("/:conversationId", sendMessage);
router.patch("/:conversationId/read", markRead);

module.exports = router;
