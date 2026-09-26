const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../services/notificationService");

// Get current user's notifications
const getNotificationsController = async (req, res, next) => {
  try {
    const userId = req.authUser.id;

    const notifications = await getUserNotifications(userId);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark one notification as read
const markNotificationAsReadController = async (
  req,
  res,
  next
) => {
  try {
    const notificationId = req.params.id;
    const userId = req.authUser.id;

    const notification = await markNotificationAsRead(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllNotificationsAsReadController = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.authUser.id;

    await markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
};