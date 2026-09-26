const supabase = require("../config/supabaseClient");

// Create a notification
const createNotification = async ({
  userId,
  type,
  message,
}) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      userId,
      type,
      message,
      read: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Get notifications for a user
const getUserNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

// Mark one notification as read
const markNotificationAsRead = async (
  notificationId,
  userId
) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("id", notificationId)
    .eq("userId", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("userId", userId)
    .eq("read", false);

  if (error) {
    throw error;
  }

  return true;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};