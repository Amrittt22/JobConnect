const supabase = require("../config/supabaseClient");

const getAuthorizedConversation = async (conversationId, userId) => {
	const { data: conversation, error } = await supabase
		.from("conversations")
		.select("id, recruiterId, candidateId")
		.eq("id", conversationId)
		.single();

	if (error || !conversation) {
		const notFoundError = new Error("Conversation not found");
		notFoundError.statusCode = 404;
		throw notFoundError;
	}

	if (
		conversation.recruiterId !== userId &&
		conversation.candidateId !== userId
	) {
		const forbiddenError = new Error(
			"You are not authorized to access this conversation"
		);
		forbiddenError.statusCode = 403;
		throw forbiddenError;
	}

	return conversation;
};

const getConversationMessages = async (conversationId, userId) => {
	await getAuthorizedConversation(conversationId, userId);

	const { data, error } = await supabase
		.from("messages")
		.select("*")
		.eq("conversationId", conversationId)
		.order("timestamp", { ascending: true });

	if (error) throw error;
	return data || [];
};

const createMessage = async ({ conversationId, senderId, text }) => {
	const conversation = await getAuthorizedConversation(conversationId, senderId);
	const trimmedText = typeof text === "string" ? text.trim() : "";

	if (!trimmedText) {
		const error = new Error("Message text is required");
		error.statusCode = 400;
		throw error;
	}

	if (trimmedText.length > 2000) {
		const error = new Error("Message cannot exceed 2000 characters");
		error.statusCode = 400;
		throw error;
	}

	const receiverId =
		conversation.recruiterId === senderId
			? conversation.candidateId
			: conversation.recruiterId;

	const { data, error } = await supabase
		.from("messages")
		.insert({ conversationId, senderId, receiverId, text: trimmedText })
		.select("*")
		.single();

	if (error) throw error;

	await supabase
		.from("conversations")
		.update({ updatedAt: new Date().toISOString() })
		.eq("id", conversationId);

	return data;
};

const markConversationRead = async (conversationId, userId) => {
	await getAuthorizedConversation(conversationId, userId);

	const { error } = await supabase
		.from("messages")
		.update({ read: true })
		.eq("conversationId", conversationId)
		.eq("receiverId", userId)
		.eq("read", false);

	if (error) throw error;
};

const markMessageRead = async (conversationId, messageId, userId) => {
	await getAuthorizedConversation(conversationId, userId);

	const { data: message, error: findError } = await supabase
		.from("messages")
		.select("id, conversationId, senderId, receiverId, read")
		.eq("id", messageId)
		.eq("conversationId", conversationId)
		.single();

	if (findError || !message) {
		const error = new Error("Message not found");
		error.statusCode = 404;
		throw error;
	}

	if (message.receiverId !== userId) {
		const error = new Error("You cannot mark this message as read");
		error.statusCode = 403;
		throw error;
	}

	if (message.read) return message;

	const { data, error } = await supabase
		.from("messages")
		.update({ read: true })
		.eq("id", messageId)
		.eq("conversationId", conversationId)
		.eq("receiverId", userId)
		.select("*")
		.single();

	if (error) throw error;
	return data;
};

module.exports = {
	getConversationMessages,
	createMessage,
	markConversationRead,
	markMessageRead,
};
