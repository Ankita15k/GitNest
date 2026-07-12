import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';
import { markAsRead, markAllAsRead as markAllApi } from '../../api/notificationApi';

const NotificationBell = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const storeMarkAsRead = useNotificationStore((s) => s.markAsRead);
  const storeMarkAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useNotificationSocket();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAuthenticated) return null;

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      storeMarkAsRead(id);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllApi();
      storeMarkAllAsRead();
    } catch {
      // ignore
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500 text-center">No notifications yet</p>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <button
                key={n._id}
                onClick={() => handleMarkRead(n._id)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition ${
                  !n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <p className="text-zinc-800 dark:text-zinc-200">{n.message}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString()}
                  {n.actor?.username && ` · ${n.actor.username}`}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
