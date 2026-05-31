import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Edit3, MessageSquare, ThumbsUp, FileText, TrendingUp, User, Save } from "lucide-react";
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

const BADGE_TIER_COLORS = {
  bronze: "from-orange-300 to-orange-500",
  silver: "from-slate-300 to-slate-500",
  gold: "from-amber-300 to-yellow-500",
  platinum: "from-pink-300 to-purple-500",
};

export default function UserProfilePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    api.get(`/badges/user/${currentUser.userId}`)
      .then(r => {
        const data = r.data;
        setProfile(data);
        setBio(data.bio || "");
        setLoading(false);
      })
      .catch(() => {
        // Profile doesn't exist yet - that's ok
        setProfile(null);
        setLoading(false);
      });
  }, [currentUser, navigate]);

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const res = await api.patch("/badges/profile", { bio });
      setProfile(prev => ({ ...prev, bio }));
      setEditingBio(false);
      toast({ type: "success", message: "Bio updated!" });
    } catch {
      toast({ type: "error", message: "Failed to update bio" });
    } finally {
      setSavingBio(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  const tier = getRankTier(profile?.points || 0);
  const isOwn = true;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile card */}
      <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl overflow-hidden shadow-sm mb-6">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iMjUwIiBjeT0iMTUwIiByPSIxMjAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNzUiIHI9IjYwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMikiLz48L3N2Zz4=')] opacity-50" />
        </div>

        {/* Avatar + basic info */}
        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-3">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(currentUser?.username || "U")} flex items-center justify-center text-white text-2xl font-black shadow-xl border-4 border-[rgb(var(--bg-surface))]`}>
              {(currentUser?.username || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-[rgb(var(--text-primary))]">{currentUser?.username}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.bg} ${tier.color}`}>
                  {tier.icon} {tier.label}
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--text-tertiary))] mt-0.5">{currentUser?.email}</p>
            </div>
          </div>

          {/* Bio section */}
          <div className="flex items-start gap-2">
            {editingBio ? (
              <div className="flex-1 space-y-2">
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  maxLength={150}
                  placeholder="Write a short bio about yourself..."
                  className="w-full input-base text-xs py-2 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="px-3 py-1 bg-[rgb(var(--color-primary))] text-white text-xs font-bold rounded-lg hover:bg-[rgb(var(--color-primary-hover))] disabled:opacity-60 flex items-center gap-1"
                  >
                    <Save size={11} /> {savingBio ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditingBio(false); setBio(profile?.bio || ""); }}
                    className="px-3 py-1 bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-secondary))] text-xs font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">
                  {profile?.bio || "No bio yet. Tell the community about yourself!"}
                </p>
                <button
                  onClick={() => setEditingBio(true)}
                  className="mt-1.5 text-[10px] text-[rgb(var(--color-primary))] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 size={10} /> {profile?.bio ? "Edit bio" : "Add bio"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-2">
            <FileText size={14} className="text-blue-500" />
          </div>
          <p className="text-lg font-black text-[rgb(var(--text-primary))]">{profile?.questionsAsked || 0}</p>
          <p className="text-[10px] text-[rgb(var(--text-tertiary))] font-semibold">Questions</p>
        </div>
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mx-auto mb-2">
            <MessageSquare size={14} className="text-teal-500" />
          </div>
          <p className="text-lg font-black text-[rgb(var(--text-primary))]">{profile?.answersProvided || 0}</p>
          <p className="text-[10px] text-[rgb(var(--text-tertiary))] font-semibold">Answers</p>
        </div>
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-2">
            <ThumbsUp size={14} className="text-amber-500" />
          </div>
          <p className="text-lg font-black text-[rgb(var(--text-primary))]">{profile?.helpfulVotes || 0}</p>
          <p className="text-[10px] text-[rgb(var(--text-tertiary))] font-semibold">Helpful Votes</p>
        </div>
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={14} className="text-purple-500" />
          </div>
          <p className="text-lg font-black text-[rgb(var(--text-primary))]">{profile?.points || 0}</p>
          <p className="text-[10px] text-[rgb(var(--text-tertiary))] font-semibold">Points</p>
        </div>
      </div>

      {/* Badges */}
      {profile?.badges?.length > 0 && (
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[rgb(var(--border-default))] flex items-center gap-2">
            <Award size={14} className="text-amber-500" />
            <h2 className="text-sm font-bold text-[rgb(var(--text-primary))]">Earned Badges</h2>
            <span className="ml-auto text-[10px] font-bold text-[rgb(var(--text-tertiary))]">{profile.badges.length} badges</span>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.badges.map((badge) => (
              <div key={badge._id} className="flex items-center gap-3 p-3 bg-[rgb(var(--bg-base))] rounded-xl border border-[rgb(var(--border-default))]">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${BADGE_TIER_COLORS[badge.tier] || BADGE_TIER_COLORS.bronze} flex items-center justify-center text-lg shadow-sm`}>
                  {badge.icon || "🏅"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[rgb(var(--text-primary))] truncate">{badge.name}</p>
                  <p className="text-[10px] text-[rgb(var(--text-tertiary))] truncate">{badge.description || badge.criteria || badge.tier}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}