const messageService = require("../services/messageService");

const getMessages = async (req, res, next) => {
	try {
		const messages = await messageService.getConversationMessages(
			req.params.conversationId,
			req.authUser.id
		);
		res.status(200).json({ success: true, messages });
	} catch (error) {
		next(error);
	}
};

const sendMessage = async (req, res, next) => {
	try {
		const message = await messageService.createMessage({
			conversationId: req.params.conversationId,
			senderId: req.authUser.id,
			text: req.body.text,
		});
		res.status(201).json({ success: true, message });
	} catch (error) {
		next(error);
	}
};

const markRead = async (req, res, next) => {
	try {
		await messageService.markConversationRead(
			req.params.conversationId,
			req.authUser.id
		);
		res.status(200).json({ success: true });
	} catch (error) {
		next(error);
	}
};

module.exports = { getMessages, sendMessage, markRead };
