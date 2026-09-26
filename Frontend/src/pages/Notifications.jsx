import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

function Notifications() {
  const { session } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error(
        "Failed to fetch notifications:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Failed to mark notification as read:",
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      console.error(
        "Failed to mark all notifications as read:",
        err
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              🔔 Notifications
            </h1>

            <p className="mt-2 text-slate-500">
              Stay updated about your applications.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Unread count */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">
            Unread notifications
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {unreadCount}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-500">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <div className="text-5xl">🔔</div>

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                No notifications
              </h2>

              <p className="mt-2 text-slate-500">
                You're all caught up!
              </p>
            </div>
          )}

        {/* Notifications */}
        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="mt-6 space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-2xl p-6 shadow-sm ring-1 transition ${
                    notification.read
                      ? "bg-white ring-slate-200"
                      : "bg-blue-50 ring-blue-200"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">

                    <div className="flex gap-4">
                      <div className="text-2xl">
                        {notification.type ===
                        "APPLICATION_STATUS"
                          ? "📄"
                          : "🔔"}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            Application Update
                          </h3>

                          {!notification.read && (
                            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>

                        <p className="mt-3 text-xs text-slate-400">
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() =>
                          markAsRead(notification.id)
                        }
                        className="self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

export default Notifications;