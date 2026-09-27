const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobroutes");
const companyRoutes = require("./routes/companyRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const socketAuthMiddleware = require("./middleware/socketAuthMiddleware");
const conversationService = require("./services/conversationService");
const messageService = require("./services/messageService");

const app = express();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
     methods: ["GET", "POST", "PATCH"],
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Basic routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JobConnect Backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy",
    supabaseConfigured: !!process.env.SUPABASE_URL,
  });
});

const activeSockets = new Map();

const socketError = (socket, message, acknowledge) => {
  const payload = { message };
  socket.emit("chat_error", payload);
  acknowledge?.({ success: false, ...payload });
};

const getCounterpartId = (conversation, userId) =>
  conversation.recruiterId === userId
    ? conversation.candidateId
    : conversation.recruiterId;

const notifyPresence = async (userId, event) => {
  try {
    const conversations = await conversationService.getUserConversations(userId);
    const notifiedUsers = new Set();

    conversations.forEach((conversation) => {
      const counterpartId = getCounterpartId(conversation, userId);
      if (!notifiedUsers.has(counterpartId)) {
        io.to(counterpartId).emit(event, { userId });
        notifiedUsers.add(counterpartId);
      }
    });
  } catch (error) {
    console.error("Presence notification failed:", error.message);
  }
};

// Socket.io connection
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  socket.join(socket.userId);
  const userSockets = activeSockets.get(socket.userId) || new Set();
  const wasOffline = userSockets.size === 0;
  userSockets.add(socket.id);
  activeSockets.set(socket.userId, userSockets);

  if (wasOffline) notifyPresence(socket.userId, "user_online");

  socket.on("join_conversation", async ({ conversationId } = {}, acknowledge) => {
    try {
      const conversation = await conversationService.getConversationById(
        conversationId,
        socket.userId
      );

      socket.join(`conversation:${conversationId}`);
      socket.emit("conversation_joined", {
        conversationId,
        room: `conversation:${conversationId}`,
      });

      const counterpartId = conversation.counterpart?.id ||
        getCounterpartId(conversation, socket.userId);
      if (activeSockets.has(counterpartId)) {
        socket.emit("user_online", { userId: counterpartId });
      }
      acknowledge?.({ success: true, conversationId });
    } catch (error) {
      socketError(socket, "Unauthorized conversation access", acknowledge);
    }
  });

  socket.on("leave_conversation", async ({ conversationId } = {}, acknowledge) => {
    try {
      await conversationService.getConversationById(conversationId, socket.userId);
      socket.leave(`conversation:${conversationId}`);
      acknowledge?.({ success: true, conversationId });
    } catch (error) {
      socketError(socket, "Unauthorized conversation access", acknowledge);
    }
  });

  socket.on("send_message", async ({ conversationId, text } = {}, acknowledge) => {
    try {
      const message = await messageService.createMessage({
        conversationId,
        senderId: socket.userId,
        text,
      });

      io.to(`conversation:${conversationId}`).emit("new_message", message);
      io.to(message.receiverId).emit("conversation:updated", { conversationId, message });
      io.to(message.senderId).emit("conversation:updated", { conversationId, message });
      acknowledge?.({ success: true, message });
    } catch (error) {
      console.error("Socket message save failed:", error);
      socketError(socket, error.statusCode ? error.message : "Failed to save message", acknowledge);
    }
  });

  const relayTyping = async (event, { conversationId } = {}, acknowledge) => {
    try {
      await conversationService.getConversationById(conversationId, socket.userId);
      socket.to(`conversation:${conversationId}`).emit(event, {
        conversationId,
        userId: socket.userId,
      });
      acknowledge?.({ success: true });
    } catch (error) {
      socketError(socket, "Unauthorized conversation access", acknowledge);
    }
  };

  socket.on("typing", (payload, acknowledge) =>
    relayTyping("user_typing", payload, acknowledge)
  );
  socket.on("stop_typing", (payload, acknowledge) =>
    relayTyping("user_stop_typing", payload, acknowledge)
  );

  socket.on("mark_message_read", async ({ conversationId, messageId } = {}, acknowledge) => {
    try {
      await messageService.markMessageRead(conversationId, messageId, socket.userId);
      io.to(`conversation:${conversationId}`).emit("message_read", {
        conversationId,
        messageId,
        userId: socket.userId,
      });
      acknowledge?.({ success: true });
    } catch (error) {
      socketError(socket, error.statusCode ? error.message : "Failed to mark message as read", acknowledge);
    }
  });

  socket.on("disconnect", () => {
    const sockets = activeSockets.get(socket.userId);
    if (!sockets) return;

    sockets.delete(socket.id);
    if (sockets.size === 0) {
      activeSockets.delete(socket.userId);
      notifyPresence(socket.userId, "user_offline");
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.io running on ws://localhost:${PORT}`);
});