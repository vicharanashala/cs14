import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, ExternalLink, Award, MessageSquare, ThumbsUp, Megaphone, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

const NOTIF_ICONS = {
  faq_approved: "✅",
  faq_rejected: "❌",
  badge_earned: "🏅",
  discussion_answered: "💬",
  answer_verified: "✓",
  comment_added: "💬",
  upvote_milestone: "▲",
  system_announcement: "📢",
  promotion_queue: "⭐",
};

const NOTIF_COLORS = {
  faq_approved: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
  faq_rejected: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 text-red-800 dark:text-red-200",
  badge_earned: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-amber-800 dark:text-amber-200",
  discussion_answered: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  answer_verified: "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800 text-teal-800 dark:text-teal-200",
  comment_added: "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800 text-violet-800 dark:text-violet-200",
  upvote_milestone: "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200",
  system_announcement: "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200",
  promotion_queue: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800 text-pink-800 dark:text-pink-200",
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all | unread

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    fetchNotifications();
  }, [currentUser, fetchNotifications, navigate]);

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markAsRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] flex items-center justify-center">
            <Bell size={18} className="text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[rgb(var(--text-primary))]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-[rgb(var(--text-secondary))]">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-lg hover:bg-[rgb(var(--bg-hover))] transition-all"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-lg hover:bg-red-50 transition-all"
            >
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display transition-all ${
            filter === "all"
              ? "bg-[rgb(var(--color-primary))] text-white"
              : "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display transition-all ${
            filter === "unread"
              ? "bg-[rgb(var(--color-primary))] text-white"
              : "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] border border-[rgb(var(--border-default))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl">
          <Bell size={32} className="mx-auto text-[rgb(var(--text-tertiary))] mb-3" />
          <p className="text-sm font-semibold text-[rgb(var(--text-secondary))]">
            {filter === "unread" ? "All caught up!" : "No notifications yet"}
          </p>
          <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
            {filter === "unread" ? "You've read everything." : "We'll notify you when something happens."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const colorClass = NOTIF_COLORS[notif.type] || "bg-[rgb(var(--bg-surface))] border-[rgb(var(--border-default))]";
            return (
              <div
                key={notif._id}
                onClick={() => handleNotifClick(notif)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  notif.read
                    ? "bg-[rgb(var(--bg-surface))] border-[rgb(var(--border-default))]"
                    : `${colorClass} shadow-sm`
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                  notif.read ? "bg-[rgb(var(--bg-hover))]" : "opacity-90"
                }`}>
                  {NOTIF_ICONS[notif.type] || "🔔"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug ${notif.read ? "text-[rgb(var(--text-secondary))]" : "text-[rgb(var(--text-primary))]"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-[rgb(var(--text-tertiary))] whitespace-nowrap">
                        {timeAgo(notif.createdAt)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                        className="p-1 text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-primary))] shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}