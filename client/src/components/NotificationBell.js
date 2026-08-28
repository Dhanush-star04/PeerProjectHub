import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const typeText = {
  comment: 'commented on',
  like: 'liked',
  rating: 'rated',
};

function timeAgo(dateString) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // ======================================================
  // FETCH NOTIFICATIONS
  // ======================================================

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications');

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(
        'Failed to load notifications:',
        err.response?.data || err.message
      );
    }
  }, []);

  // ======================================================
  // LOAD + POLL NOTIFICATIONS
  // ======================================================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ======================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ======================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // ======================================================
  // TOGGLE NOTIFICATIONS
  // ======================================================

  const handleToggle = async () => {
    const opening = !open;

    setOpen(opening);

    if (opening && unreadCount > 0) {
      try {
        await API.patch('/notifications/read');

        setUnreadCount(0);

        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
      } catch (err) {
        console.error(
          'Failed to mark notifications read:',
          err.response?.data || err.message
        );
      }
    }
  };

  // ======================================================
  // CLICK NOTIFICATION
  // ======================================================

  const handleNotificationClick = async (notification) => {
    try {
      setOpen(false);

      // --------------------------------------------------
      // Get project ID safely
      // --------------------------------------------------

      let projectId = notification?.project;

      // If project is populated:
      // { _id: "123..." }
      if (
        projectId &&
        typeof projectId === 'object'
      ) {
        projectId = projectId._id;
      }

      // Convert ObjectId/string safely
      if (projectId) {
        projectId = String(projectId);
      }

      console.log(
        'Notification clicked:',
        notification
      );

      console.log(
        'Project ID:',
        projectId
      );

      // --------------------------------------------------
      // Make sure project ID exists
      // --------------------------------------------------

      if (!projectId) {
        console.error(
          'Notification does not contain a project ID:',
          notification
        );

        return;
      }

      // --------------------------------------------------
      // Verify that project actually exists
      // --------------------------------------------------

      try {
        await API.get(`/projects/${projectId}`);

        console.log(
          'Project exists:',
          projectId
        );
      } catch (projectError) {
        console.error(
          'Project could not be fetched:',
          projectError.response?.data ||
            projectError.message
        );

        return;
      }

      // --------------------------------------------------
      // Navigate to project page
      // --------------------------------------------------

      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error(
        'Notification click error:',
        error
      );
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* Notification button */}

      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
      >
        <span className="text-lg">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9
              ? '9+'
              : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

          {/* Header */}

          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-950">
              Notifications
            </p>
          </div>

          {/* Notification list */}

          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    !notification.read
                      ? 'bg-brand-50/60'
                      : ''
                  }`}
                >

                  {/* Actor avatar */}

                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                    {notification.actorName
                      ?.charAt(0)
                      ?.toUpperCase() || '?'}
                  </span>

                  {/* Notification content */}

                  <div className="min-w-0 flex-1">

                    <p className="text-sm leading-5 text-slate-700">

                      <span className="font-semibold text-slate-950">
                        {notification.actorName}
                      </span>

                      {' '}

                      {typeText[
                        notification.type
                      ] || 'interacted with'}

                      {' '}

                      <span className="font-semibold text-slate-950">
                        {notification.projectTitle}
                      </span>

                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {timeAgo(
                        notification.createdAt
                      )}
                    </p>

                  </div>

                  {/* Unread indicator */}

                  {!notification.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                  )}

                </button>
              ))
            )}

          </div>
        </div>
      )}
    </div>
  );
}