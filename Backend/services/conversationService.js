const supabase = require("../config/supabaseClient");

/**
 * Get or create a 1-on-1 conversation between a recruiter and a candidate.
 * Ensures the logged-in user is a participant and resolves recruiter/candidate IDs.
 *
 * @param {Object} params
 * @param {string} params.currentUserId - Authenticated user UUID (req.authUser.id)
 * @param {string} [params.counterpartId] - Counterpart user UUID
 * @param {string} [params.recruiterId] - Explicit recruiter UUID
 * @param {string} [params.candidateId] - Explicit candidate UUID
 * @returns {Promise<Object>} The conversation object with participant profiles
 */
const getOrCreateConversation = async ({
  currentUserId,
  counterpartId,
  recruiterId: explicitRecruiterId,
  candidateId: explicitCandidateId,
}) => {
  let recruiterId = explicitRecruiterId;
  let candidateId = explicitCandidateId;

  // If counterpartId is provided, resolve recruiter vs candidate from their profiles
  if (counterpartId) {
    if (counterpartId === currentUserId) {
      const error = new Error("Cannot start a conversation with yourself");
      error.statusCode = 400;
      throw error;
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, role")
      .in("id", [currentUserId, counterpartId]);

    if (usersError || !users || users.length !== 2) {
      const error = new Error("One or both users not found");
      error.statusCode = 404;
      throw error;
    }

    const currentUser = users.find((u) => u.id === currentUserId);
    const counterpart = users.find((u) => u.id === counterpartId);

    if (currentUser.role === "RECRUITER") {
      recruiterId = currentUser.id;
      candidateId = counterpart.id;
    } else if (currentUser.role === "JOBSEEKER") {
      recruiterId = counterpart.id;
      candidateId = currentUser.id;
    } else {
      // If admin or unspecified, assign order deterministically
      recruiterId = currentUser.id;
      candidateId = counterpart.id;
    }
  }

  if (!recruiterId || !candidateId) {
    const error = new Error("recruiterId and candidateId are required");
    error.statusCode = 400;
    throw error;
  }

  // Ensure current user is one of the participants
  if (currentUserId !== recruiterId && currentUserId !== candidateId) {
    const error = new Error(
      "You are not authorized to access or create this conversation"
    );
    error.statusCode = 403;
    throw error;
  }

  if (recruiterId === candidateId) {
    const error = new Error(
      "Recruiter and candidate cannot be the same user"
    );
    error.statusCode = 400;
    throw error;
  }

  // 1. Check if conversation already exists
  const { data: existingConversation, error: findError } = await supabase
    .from("conversations")
    .select(`
      *,
      recruiter:users!recruiterId(id, name, email, role, profilePic),
      candidate:users!candidateId(id, name, email, role, profilePic)
    `)
    .eq("recruiterId", recruiterId)
    .eq("candidateId", candidateId)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (existingConversation) {
    return existingConversation;
  }

  // 2. Create new conversation
  const { data: newConversation, error: createError } = await supabase
    .from("conversations")
    .insert({
      recruiterId,
      candidateId,
    })
    .select(`
      *,
      recruiter:users!recruiterId(id, name, email, role, profilePic),
      candidate:users!candidateId(id, name, email, role, profilePic)
    `)
    .single();

  if (createError) {
    // If concurrent insert occurred, fetch existing
    if (createError.code === "23505") {
      const { data: retryFind } = await supabase
        .from("conversations")
        .select(`
          *,
          recruiter:users!recruiterId(id, name, email, role, profilePic),
          candidate:users!candidateId(id, name, email, role, profilePic)
        `)
        .eq("recruiterId", recruiterId)
        .eq("candidateId", candidateId)
        .single();

      return retryFind;
    }
    throw createError;
  }

  return newConversation;
};

/**
 * Get all conversations for a specific user, enriched with the counterpart profile,
 * last message, and unread message count.
 *
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<Array>} List of conversation summaries
 */
const getUserConversations = async (userId) => {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *,
      recruiter:users!recruiterId(id, name, email, role, profilePic),
      candidate:users!candidateId(id, name, email, role, profilePic)
    `)
    .or(`recruiterId.eq.${userId},candidateId.eq.${userId}`)
    .order("updatedAt", { ascending: false });

  if (error) {
    throw error;
  }

  if (!conversations || conversations.length === 0) {
    return [];
  }

  // Enrich each conversation with last message and unread count
  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      // 1. Fetch latest message
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("id, text, timestamp, senderId, receiverId, read")
        .eq("conversationId", conv.id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      // 2. Count unread messages for this user in this conversation
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversationId", conv.id)
        .eq("receiverId", userId)
        .eq("read", false);

      // Determine counterpart
      const counterpart =
        conv.recruiterId === userId ? conv.candidate : conv.recruiter;

      return {
        ...conv,
        counterpart,
        lastMessage: lastMessage || null,
        unreadCount: unreadCount || 0,
      };
    })
  );

  return enrichedConversations;
};

/**
 * Get a specific conversation by ID with authorization verification.
 *
 * @param {string} conversationId - Conversation UUID
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<Object>} Conversation object
 */
const getConversationById = async (conversationId, userId) => {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(`
      *,
      recruiter:users!recruiterId(id, name, email, role, profilePic),
      candidate:users!candidateId(id, name, email, role, profilePic)
    `)
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
      "You are not authorized to view this conversation"
    );
    forbiddenError.statusCode = 403;
    throw forbiddenError;
  }

  const counterpart =
    conversation.recruiterId === userId
      ? conversation.candidate
      : conversation.recruiter;

  return {
    ...conversation,
    counterpart,
  };
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationById,
};
