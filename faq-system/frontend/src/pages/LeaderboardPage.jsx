import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, Star, TrendingUp, Award, ChevronRight } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

const AVATAR_COLORS = [
  "from-pink-400 to-rose-500", "from-violet-400 to-purple-500", "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500", "from-indigo-400 to-blue-500",
];

function getAvatarColor(name) {
  let hash = 0;
  for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = "md" }) {
  const color = getAvatarColor(name || "U");
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-12 h-12 text-lg" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
      {(name || "U")[0].toUpperCase()}
    </div>
  );
}

const RANK_TIERS = [
  { label: "Newcomer", min: 0, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", icon: "🌱" },
  { label: "Contributor", min: 50, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40", icon: "🌿" },
  { label: "Expert", min: 200, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/40", icon: "⭐" },
  { label: "Mentor", min: 500, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40", icon: "🏅" },
  { label: "Hall of Fame", min: 1000, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/40", icon: "👑" },
];

function getRankTier(points) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (points >= RANK_TIERS[i].min) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/badges/leaderboard").catch(() => ({ data: [] })),
      api.get("/badges").catch(() => ({ data: [] })),
    ]).then(([lbRes, badgeRes]) => {
      setProfiles(Array.isArray(lbRes.data) ? lbRes.data : []);
      setBadges(Array.isArray(badgeRes.data) ? badgeRes.data : []);
      setLoading(false);
    });
  }, []);

  const currentUserProfile = currentUser
    ? profiles.find(p => p.userId?._id === currentUser.userId)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] flex items-center justify-center">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[rgb(var(--text-primary))]">Leaderboard</h1>
            <p className="text-xs text-[rgb(var(--text-secondary))]">Top contributors ranked by points</p>
          </div>
        </div>
      </div>

      {/* Current user card */}
      {currentUser && currentUserProfile && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider mb-2">Your Rank</p>
          <div className="flex items-center gap-3">
            <Avatar name={currentUser.username} size="lg" />
            <div className="flex-1">
              <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{currentUser.username}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {(() => {
                  const tier = getRankTier(currentUserProfile.points || 0);
                  return (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.bg} ${tier.color}`}>
                      {tier.icon} {tier.label}
                    </span>
                  );
                })()}
                <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{currentUserProfile.points || 0} pts</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-[rgb(var(--text-primary))]">#{profiles.findIndex(p => p.userId?._id === currentUser.userId) + 1}</p>
              <p className="text-[10px] text-[rgb(var(--text-tertiary))]">global rank</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {!loading && profiles.length >= 3 && (
        <div className="mb-6 flex items-end justify-center gap-3">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <Avatar name={profiles[1].userId?.username || "User"} size="lg" />
            <div className="text-center">
              <p className="text-xs font-bold text-[rgb(var(--text-secondary))] truncate max-w-20">{profiles[1].userId?.username || "—"}</p>
              <div className="w-24 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-2 text-center">
                <Medal size={16} className="mx-auto text-slate-400 mb-0.5" />
                <p className="text-xs font-black text-[rgb(var(--text-primary))]">{profiles[1].points || 0}</p>
                <p className="text-[9px] text-[rgb(var(--text-tertiary))]">points</p>
              </div>
              <p className="text-[10px] font-bold text-slate-500 mt-1">2nd</p>
            </div>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar name={profiles[0].userId?.username || "User"} size="lg" />
              <span className="absolute -top-1 -right-1 text-lg">👑</span>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-[rgb(var(--text-primary))] truncate max-w-20">{profiles[0].userId?.username || "—"}</p>
              <div className="w-28 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-amber-300 dark:border-amber-700 rounded-xl p-3 text-center">
                <Trophy size={20} className="mx-auto text-amber-500 mb-0.5" />
                <p className="text-sm font-black text-amber-700 dark:text-amber-300">{profiles[0].points || 0}</p>
                <p className="text-[9px] text-amber-600 dark:text-amber-400">points</p>
              </div>
              <p className="text-[10px] font-bold text-amber-600 mt-1">1st</p>
            </div>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <Avatar name={profiles[2].userId?.username || "User"} size="lg" />
            <div className="text-center">
              <p className="text-xs font-bold text-[rgb(var(--text-secondary))] truncate max-w-20">{profiles[2].userId?.username || "—"}</p>
              <div className="w-24 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-2 text-center">
                <Medal size={16} className="mx-auto text-orange-400 mb-0.5" />
                <p className="text-xs font-black text-[rgb(var(--text-primary))]">{profiles[2].points || 0}</p>
                <p className="text-[9px] text-[rgb(var(--text-tertiary))]">points</p>
              </div>
              <p className="text-[10px] font-bold text-orange-500 mt-1">3rd</p>
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard list */}
      <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[rgb(var(--border-default))]">
          <h2 className="text-sm font-bold text-[rgb(var(--text-primary))]">All Rankings</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <div className="skeleton h-4 w-32 mx-auto rounded" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy size={28} className="mx-auto text-[rgb(var(--text-tertiary))] mb-2" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">No rankings yet</p>
            <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">Be the first to contribute and climb the board!</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--border-default))]">
            {profiles.map((profile, idx) => {
              const tier = getRankTier(profile.points || 0);
              const isCurrentUser = currentUser?.userId === profile.userId?._id;
              const rank = idx + 1;
              return (
                <div
                  key={profile._id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isCurrentUser ? "bg-indigo-50 dark:bg-indigo-950/20" : "hover:bg-[rgb(var(--bg-hover))]"
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    rank === 1 ? "bg-amber-100 text-amber-700" :
                    rank === 2 ? "bg-slate-100 text-slate-500" :
                    rank === 3 ? "bg-orange-100 text-orange-600" :
                    "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-tertiary))]"
                  }`}>
                    {rank <= 3 ? [1,2,3][rank-1] === 1 ? "1" : rank === 2 ? "2" : "3" : rank}
                  </div>

                  <Avatar name={profile.userId?.username || "U"} size="sm" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[rgb(var(--text-primary))] truncate">
                        {profile.userId?.username || "—"}
                      </p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${tier.bg} ${tier.color}`}>
                        {tier.icon} {tier.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-[rgb(var(--text-tertiary))]">
                        {profile.answersProvided || 0} answers
                      </span>
                      <span className="text-[10px] text-[rgb(var(--text-tertiary))]">
                        {profile.helpfulVotes || 0} helpful votes
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-[rgb(var(--text-primary))]">{profile.points || 0}</p>
                    <p className="text-[9px] text-[rgb(var(--text-tertiary))]">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badges showcase */}
      {badges.length > 0 && (
        <div className="mt-6 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[rgb(var(--border-default))]">
            <h2 className="text-sm font-bold text-[rgb(var(--text-primary))] flex items-center gap-2">
              <Award size={14} className="text-amber-500" /> Available Badges
            </h2>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.map((badge) => (
              <div key={badge._id} className="flex flex-col items-center gap-1.5 p-3 bg-[rgb(var(--bg-base))] rounded-xl border border-[rgb(var(--border-default))] text-center">
                <span className="text-2xl">{badge.icon || "🏅"}</span>
                <p className="text-[11px] font-bold text-[rgb(var(--text-primary))] leading-tight">{badge.name}</p>
                <p className="text-[9px] text-[rgb(var(--text-tertiary))] leading-tight line-clamp-2">{badge.description || badge.criteria || ""}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                  badge.tier === "gold" ? "bg-amber-100 text-amber-700" :
                  badge.tier === "silver" ? "bg-slate-100 text-slate-600" :
                  badge.tier === "platinum" ? "bg-pink-100 text-pink-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {badge.tier} · {badge.points}pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}