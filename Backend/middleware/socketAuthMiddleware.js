const supabase = require("../config/supabaseClient");

const socketAuthMiddleware = async (socket, next) => {
	try {
		const token = socket.handshake.auth?.token;

		if (!token) return next(new Error("Authentication required"));

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) return next(new Error("Invalid or expired token"));

		socket.userId = user.id;
		next();
	} catch (error) {
		next(new Error("Socket authentication failed"));
	}
};

module.exports = socketAuthMiddleware;
