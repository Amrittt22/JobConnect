const conversationService = require("../services/conversationService");

const createConversation = async (req, res, next) => {
	try {
		const conversation = await conversationService.getOrCreateConversation({
			currentUserId: req.authUser.id,
			counterpartId: req.body.counterpartId,
			recruiterId: req.body.recruiterId,
			candidateId: req.body.candidateId,
		});

		res.status(200).json({ success: true, conversation });
	} catch (error) {
		next(error);
	}
};

const getConversations = async (req, res, next) => {
	try {
		const conversations = await conversationService.getUserConversations(
			req.authUser.id
		);
		res.status(200).json({ success: true, conversations });
	} catch (error) {
		next(error);
	}
};

const getConversation = async (req, res, next) => {
	try {
		const conversation = await conversationService.getConversationById(
			req.params.id,
			req.authUser.id
		);
		res.status(200).json({ success: true, conversation });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createConversation,
	getConversations,
	getConversation,
};
