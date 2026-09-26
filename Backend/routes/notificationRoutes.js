const express = require("express");

const {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get current user's notifications
router.get(
  "/",
  authMiddleware,
  getNotificationsController
);

// Mark one notification as read
router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsReadController
);

// Mark all notifications as read
router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsReadController
);

module.exports = router;