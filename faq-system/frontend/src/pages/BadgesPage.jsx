import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];

const TIER_STYLES = {
  bronze: {
    border: "border-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    label: "Bronze",
    emoji: "🟤",
  },
  silver: {
    border: "border-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800/30",
    text: "text-gray-500 dark:text-gray-300",
    label: "Silver",
    emoji: "⚪",
  },
  gold: {
    border: "border-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-600 dark:text-yellow-400",
    label: "Gold",
    emoji: "🟡",
  },
  platinum: {
    border: "border-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-300",
    label: "Platinum",
    emoji: "🟣",
  },
};

const LOCKED_STYLES = {
  border: "border-[rgb(var(--border-default))]",
  bg: "bg-[rgb(var(--bg-secondary))]",
  text: "text-[rgb(var(--text-tertiary))]",
};

export default function BadgesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!currentUser?.userId) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.get("/badges"),
      api.get(`/users/${currentUser.userId}/profile`),
    ])
      .then(([badgesRes, profileRes]) => {
        if (cancelled) return;
        setAllBadges(badgesRes.data || []);
        setUserBadges(profileRes.data?.badges || []);
        setStats(profileRes.data?.stats || null);
      })
      .catch((err) => {
        if (!cancelled) console.error("[BadgesPage] error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentUser]);

  // Group badges by tier
  const grouped = {};
  for (const tier of TIER_ORDER) {
    grouped[tier] = allBadges.filter((b) => b.tier === tier);
  }

  // Filter tiers
  const tiersToShow = filter === "all" ? TIER_ORDER : TIER_ORDER.filter((t) => t === filter);

  const earnedNames = new Set(userBadges.map((b) => b.name));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[rgb(var(--color-primary))] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] font-display">🏅 Badges</h1>
        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
          Earn badges by participating in the community
        </p>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Questions", value: stats.questionsAsked || 0 },
            { label: "Answers", value: stats.answersGiven || 0 },
            { label: "Accepted", value: stats.answersAccepted || 0 },
            { label: "Upvotes", value: stats.upvotesReceived || 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-[rgb(var(--color-primary))] font-display">{value}</p>
              <p className="text-[10px] text-[rgb(var(--text-tertiary))] uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Earned badges ribbon */}
      {userBadges.length > 0 && (
        <div className="mb-6 p-4 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl">
          <p className="text-xs font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider mb-3">
            Your Badges ({userBadges.length}/{allBadges.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {userBadges.map((b) => {
              const s = TIER_STYLES[b.tier] || TIER_STYLES.bronze;
              return (
                <div
                  key={b.name}
                  title={b.description}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-xs font-display ${s.border} ${s.bg} ${s.text}`}
                >
                  <span>{b.icon}</span>
                  <span>{b.name}</span>
                  <span className="opacity-60 text-[10px]">+{b.points}pts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tier filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            filter === "all"
              ? "bg-[rgb(var(--color-primary))] text-white border-[rgb(var(--color-primary))]"
              : "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border-default))]"
          }`}
        >
          All
        </button>
        {TIER_ORDER.map((tier) => {
          const s = TIER_STYLES[tier];
          const count = grouped[tier]?.length || 0;
          return (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                filter === tier
                  ? `${s.bg} ${s.text} ${s.border}`
                  : "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] border-[rgb(var(--border-default))]"
              }`}
            >
              {s.emoji} {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Badge cards */}
      <div className="space-y-3">
        {tiersToShow.map((tier) =>
          grouped[tier].map((badge) => {
            const earned = earnedNames.has(badge.name);
            const s = TIER_STYLES[badge.tier] || TIER_STYLES.bronze;
            return (
              <div
                key={badge._id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  earned
                    ? `${s.bg} ${s.border}`
                    : `bg-[rgb(var(--bg-secondary))] ${LOCKED_STYLES.border} opacity-60`
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                    earned ? `${s.bg}` : "bg-[rgb(var(--bg-tertiary))]"
                  } border ${earned ? s.border : "border-[rgb(var(--border-default))]"}`}
                >
                  {badge.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-bold font-display ${earned ? s.text : "text-[rgb(var(--text-secondary))]"}`}>
                      {badge.name}
                    </p>
                    {earned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300">
                        ✓ Earned
                      </span>
                    )}
                    <span className={`text-[10px] font-bold ${earned ? s.text : "text-[rgb(var(--text-tertiary))]"}`}>
                      {s.emoji} {s.label}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${earned ? "text-[rgb(var(--text-secondary))]" : "text-[rgb(var(--text-tertiary))]"}`}>
                    {badge.description}
                  </p>
                  <p className={`text-[10px] mt-1 font-semibold ${earned ? s.text : "text-[rgb(var(--text-tertiary))]"}`}>
                    🔓 {badge.criteria}
                  </p>
                </div>

                {/* Points */}
                <div className={`text-right shrink-0 ${earned ? s.text : "text-[rgb(var(--text-tertiary))]"}`}>
                  <p className="text-lg font-bold font-display">{badge.points}</p>
                  <p className="text-[9px] uppercase tracking-wider">pts</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}