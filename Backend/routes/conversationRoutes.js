const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
	createConversation,
	getConversations,
	getConversation,
} = require("../controllers/conversationController");

const router = express.Router();

router.use(authMiddleware);
router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversation);

module.exports = router;
