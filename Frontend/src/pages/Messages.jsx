import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import socket, { connectSocket } from "../socket";

const apiUrl = import.meta.env.VITE_API_URL;

function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { session, user } = useSelector((state) => state.auth);
  const currentUserId = user?.id || session?.user?.id;
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const [isCounterpartOnline, setIsCounterpartOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const typingTimerRef = useRef(null);
  const requestedReadRef = useRef(new Set());
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const authConfig = useMemo(
    () =>
      session?.access_token
        ? { headers: { Authorization: `Bearer ${session.access_token}` } }
        : null,
    [session]
  );
  const counterpartId = conversation?.counterpart?.id;

  const appendMessage = (message) => {
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message]
    );
  };

  const loadConversations = useCallback(async () => {
    if (!session?.access_token) return;
    const response = await axios.get(`${apiUrl}/api/conversations`, authConfig);
    setConversations(response.data.conversations || []);
  }, [session?.access_token, authConfig]);

  const loadThread = useCallback(async (selectedId) => {
    if (!session?.access_token || !selectedId) return;

    setLoadingThread(true);
    try {
      const [conversationResponse, messagesResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/conversations/${selectedId}`, authConfig),
        axios.get(`${apiUrl}/api/messages/${selectedId}`, authConfig),
      ]);

      setConversation(conversationResponse.data.conversation);
      setMessages(messagesResponse.data.messages || []);
      requestedReadRef.current.clear();
      setConversations((current) =>
        current.map((item) =>
          item.id === selectedId ? { ...item, unreadCount: 0 } : item
        )
      );
    } finally {
      setLoadingThread(false);
    }
  }, [session?.access_token, authConfig]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!authConfig) return;

      try {
        setLoading(true);
        setError("");
        await loadConversations();
        if (active && conversationId) await loadThread(conversationId);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to load conversations");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [conversationId, session?.access_token, authConfig, loadConversations, loadThread]);

  useEffect(() => {
    if (!session?.access_token) return undefined;

    const chatSocket = connectSocket(session.access_token);
    const joinCurrentConversation = () => {
      if (conversationId) {
        chatSocket.emit("join_conversation", { conversationId });
      }
    };
    const markUnreadMessages = () => {
      messagesRef.current.forEach((message) => {
        if (
          message.receiverId === currentUserId &&
          !message.read &&
          !requestedReadRef.current.has(message.id)
        ) {
          requestedReadRef.current.add(message.id);
          chatSocket.emit("mark_message_read", {
            conversationId,
            messageId: message.id,
          });
        }
      });
    };
    const handleJoined = ({ conversationId: joinedId }) => {
      if (joinedId === conversationId) {
        setError("");
        markUnreadMessages();
      }
    };
    const handleNewMessage = (message) => {
      if (message.conversationId !== conversationId) return;

      appendMessage(message);
      if (message.receiverId === currentUserId) {
        chatSocket.emit("mark_message_read", {
          conversationId,
          messageId: message.id,
        });
      }
    };
    const handleConversationUpdate = ({ conversationId: updatedId, message }) => {
      setConversations((current) => {
        const existing = current.find((item) => item.id === updatedId);
        if (!existing) {
          loadConversations().catch(() => {});
          return current;
        }

        return [
          {
            ...existing,
            lastMessage: message,
            unreadCount:
              updatedId === conversationId || message.receiverId !== currentUserId
                ? 0
                : (existing.unreadCount || 0) + 1,
          },
          ...current.filter((item) => item.id !== updatedId),
        ];
      });
    };
    const handleTyping = ({ conversationId: typingConversationId, userId }) => {
      if (typingConversationId === conversationId && userId !== currentUserId) {
        setTypingUserId(userId);
      }
    };
    const handleStopTyping = ({ conversationId: typingConversationId, userId }) => {
      if (typingConversationId === conversationId && userId !== currentUserId) {
        setTypingUserId(null);
      }
    };
    const handlePresence = ({ userId, online }) => {
      if (userId === counterpartId) setIsCounterpartOnline(online);
    };
    const handleOnline = (payload) => handlePresence({ ...payload, online: true });
    const handleOffline = (payload) => handlePresence({ ...payload, online: false });
    const handleRead = ({ conversationId: readConversationId, messageId }) => {
      if (readConversationId !== conversationId) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, read: true } : message
        )
      );
    };
    const handleChatError = ({ message }) => setError(message || "Chat error");
    const handleConnectError = (connectError) => {
      setError(connectError.message || "Chat connection failed");
    };
    const handleDisconnect = () => setIsCounterpartOnline(false);

    chatSocket.on("connect", joinCurrentConversation);
    chatSocket.on("conversation_joined", handleJoined);
    chatSocket.on("new_message", handleNewMessage);
    chatSocket.on("conversation:updated", handleConversationUpdate);
    chatSocket.on("user_typing", handleTyping);
    chatSocket.on("user_stop_typing", handleStopTyping);
    chatSocket.on("user_online", handleOnline);
    chatSocket.on("user_offline", handleOffline);
    chatSocket.on("message_read", handleRead);
    chatSocket.on("chat_error", handleChatError);
    chatSocket.on("connect_error", handleConnectError);
    chatSocket.on("disconnect", handleDisconnect);

    return () => {
      chatSocket.off("connect", joinCurrentConversation);
      chatSocket.off("conversation_joined", handleJoined);
      chatSocket.off("new_message", handleNewMessage);
      chatSocket.off("conversation:updated", handleConversationUpdate);
      chatSocket.off("user_typing", handleTyping);
      chatSocket.off("user_stop_typing", handleStopTyping);
      chatSocket.off("user_online", handleOnline);
      chatSocket.off("user_offline", handleOffline);
      chatSocket.off("message_read", handleRead);
      chatSocket.off("chat_error", handleChatError);
      chatSocket.off("connect_error", handleConnectError);
      chatSocket.off("disconnect", handleDisconnect);
    };
  }, [conversationId, session?.access_token, currentUserId, counterpartId, loadConversations]);

  useEffect(() => {
    if (!conversationId || !session?.access_token) return undefined;

    const chatSocket = connectSocket(session.access_token);
    chatSocket.emit("join_conversation", { conversationId });

    return () => {
      chatSocket.emit("stop_typing", { conversationId });
      chatSocket.emit("leave_conversation", { conversationId });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypingUserId(null);
    };
  }, [conversationId, session?.access_token]);

  useEffect(() => {
    if (!conversationId || !socket.connected) return;

    messages.forEach((message) => {
      if (
        message.receiverId === currentUserId &&
        !message.read &&
        !requestedReadRef.current.has(message.id)
      ) {
        requestedReadRef.current.add(message.id);
        socket.emit("mark_message_read", { conversationId, messageId: message.id });
      }
    });
  }, [conversationId, messages, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextChange = (event) => {
    const nextText = event.target.value;
    setText(nextText);
    if (!conversationId || !socket.connected) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (!nextText.trim()) {
      socket.emit("stop_typing", { conversationId });
      return;
    }

    socket.emit("typing", { conversationId });
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId });
    }, 900);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !conversationId || !authConfig) return;

    setSending(true);
    setError("");
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socket.emit("stop_typing", { conversationId });

    try {
      const chatSocket = connectSocket(session.access_token);
      if (chatSocket.connected) {
        await new Promise((resolve, reject) => {
          chatSocket.emit("send_message", { conversationId, text: trimmedText }, (result) => {
            if (!result?.success) {
              reject(new Error(result?.message || "Failed to send message"));
              return;
            }
            appendMessage(result.message);
            resolve(result);
          });
        });
      } else {
        const response = await axios.post(
          `${apiUrl}/api/messages/${conversationId}`,
          { text: trimmedText },
          authConfig
        );
        appendMessage(response.data.message);
      }
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50">Loading conversations...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-200 md:border-r md:border-b-0">
          <div className="border-b border-slate-200 p-5">
            <button onClick={() => navigate(-1)} className="text-sm font-medium text-slate-600 hover:text-slate-900">← Back</button>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">Messages</h1>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No conversations yet.</p>
            ) : conversations.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/messages/${item.id}`)}
                className={`w-full rounded-xl p-3 text-left hover:bg-slate-50 ${item.id === conversationId ? "bg-indigo-50" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{item.counterpart?.name || "Conversation"}</span>
                  {item.unreadCount > 0 && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">{item.unreadCount}</span>}
                </div>
                <p className="mt-1 truncate text-sm text-slate-500">{item.lastMessage?.text || "No messages yet"}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col">
          {!conversationId ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-slate-500">Select a conversation to start chatting.</div>
          ) : loadingThread ? (
            <div className="flex flex-1 items-center justify-center text-slate-500">Loading conversation...</div>
          ) : (
            <>
              <header className="border-b border-slate-200 p-5">
                <h2 className="text-xl font-bold text-slate-900">{conversation?.counterpart?.name || "Conversation"}</h2>
                <p className="mt-1 text-sm text-slate-500">{isCounterpartOnline ? "Online" : "Offline"}</p>
              </header>
              {error && <p className="m-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
                {messages.length === 0 ? <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p> : messages.map((message) => {
                  const isCurrentUserMessage =
                    String(message.senderId) === String(currentUserId);

                  return (
                  <div key={message.id} className={`flex ${isCurrentUserMessage ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isCurrentUserMessage ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm"}`}>
                      <p>{message.text}</p>
                      {isCurrentUserMessage && <p className="mt-1 text-right text-xs text-slate-300">{message.read ? "Read" : "Sent"}</p>}
                    </div>
                  </div>
                  );
                })}
                {typingUserId && <p className="text-sm italic text-slate-500">{conversation?.counterpart?.name || "User"} is typing...</p>}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="flex gap-3 border-t border-slate-200 p-4">
                <input value={text} onChange={handleTextChange} maxLength={2000} placeholder="Write a message" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500" />
                <button disabled={sending} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60">{sending ? "Sending..." : "Send"}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Messages;
