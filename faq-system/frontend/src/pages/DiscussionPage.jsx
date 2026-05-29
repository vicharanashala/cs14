import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

const CATEGORIES = [
  "All", "About the Internship", "Timing and Dates", "NOC", "Selection and Offer Letter",
  "Work and Mentorship", "Communication Channels", "Interviews", "Certificate", "Rosetta",
  "Phase 1 and Coursework", "Yaksha Chat", "ViBe Platform", "Team Formation",
];

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
  const sz = size === "sm" ? "w-7 h-7 text-xs" : size === "lg" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {(name || "U")[0].toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    answered: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    closed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${map[status] || map.open}`}>
      {status}
    </span>
  );
}

export default function DiscussionPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [showAskModal, setShowAskModal] = useState(false);
  const [askForm, setAskForm] = useState({ question: "", category: "About the Internship", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchDiscussions = () => {
    setLoading(true);
    const params = category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    api.get(`/discussions${params}`)
      .then((r) => setDiscussions(r.data || []))
      .catch(() => toast({ type: "error", message: "Failed to load discussions" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDiscussions(); }, [category]);

  const sorted = [...discussions].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sort === "votes") return (b.upvotes || 0) - (a.upvotes || 0);
    if (sort === "answers") return (b.answers?.length || 0) - (a.answers?.length || 0);
    return 0;
  });

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!askForm.question.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/discussions", {
        question: askForm.question,
        category: askForm.category,
        description: askForm.description,
      });
      toast({ type: "success", message: "Question posted!" });
      setShowAskModal(false);
      setAskForm({ question: "", category: "About the Internship", description: "" });
      fetchDiscussions();
    } catch {
      toast({ type: "error", message: "Failed to post question" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id, currentUpvotes) => {
    try {
      const res = await api.post(`/discussions/${id}/upvote`);
      setDiscussions((prev) => prev.map((d) => d._id === id ? { ...d, upvotes: res.data.upvotes } : d));
    } catch {
      toast({ type: "error", message: "Failed to upvote" });
    }
  };

  const handleReplySubmit = async (discussionId) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await api.post(`/discussions/${discussionId}/answers`, { content: replyText });
      setReplyText("");
      setReplyingTo(null);
      toast({ type: "success", message: "Reply posted!" });
      fetchDiscussions();
    } catch {
      toast({ type: "error", message: "Failed to post reply" });
    } finally {
      setReplySubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[rgb(var(--text-primary))]">Community Discussions</h1>
          <p className="text-sm text-[rgb(var(--text-tertiary))] mt-0.5">
            Ask questions, share knowledge, get answers
          </p>
        </div>
        <button
          onClick={() => currentUser ? setShowAskModal(true) : navigate("/login")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--color-primary))] text-white text-sm font-semibold hover:bg-[rgb(var(--color-primary-hover))] transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ask a question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === cat
                ? "bg-[rgb(var(--color-primary))] text-white"
                : "bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:border-indigo-300 hover:text-[rgb(var(--text-primary))]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl w-fit">
        {["newest", "votes", "answers"].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              sort === s
                ? "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-primary))] shadow-sm"
                : "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Discussion list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-5">
              <div className="skeleton h-4 w-3/4 mb-3 rounded" />
              <div className="skeleton h-3 w-full mb-2 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-2">No discussions yet</h3>
          <p className="text-sm text-[rgb(var(--text-tertiary))] mb-5">
            {category !== "All" ? `No ${category} discussions yet.` : "Be the first to start a discussion!"}
          </p>
          <button
            onClick={() => setShowAskModal(true)}
            className="px-5 py-2 rounded-xl bg-[rgb(var(--color-primary))] text-white text-sm font-semibold hover:bg-[rgb(var(--color-primary-hover))] transition-colors"
          >
            Start a discussion
          </button>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {sorted.map((d) => (
            <div key={d._id}
              className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-5 card-hover">
              <div className="flex gap-3">
                {/* Upvote column */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleUpvote(d._id, d.upvotes)}
                    className="w-8 h-8 rounded-lg bg-[rgb(var(--bg-hover))] hover:bg-indigo-100 dark:hover:bg-indigo-900/40 flex items-center justify-center text-[rgb(var(--text-tertiary))] hover:text-indigo-500 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-[rgb(var(--text-secondary))]">{d.upvotes || 0}</span>
                  <button className="w-8 h-8 rounded-lg bg-[rgb(var(--bg-hover))] hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <button
                      onClick={() => setExpanded(d._id)}
                      className="text-sm font-semibold text-[rgb(var(--text-primary))] hover:text-indigo-500 transition-colors text-left leading-snug"
                    >
                      {d.question}
                    </button>
                    <StatusBadge status={d.status || "open"} />
                  </div>

                  {d.description && (
                    <p className="text-xs text-[rgb(var(--text-secondary))] mb-2 line-clamp-2">{d.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-tertiary))]">
                      {d.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Avatar name={d.author?.username || "U"} size="sm" />
                      <span className="text-[11px] text-[rgb(var(--text-tertiary))]">{d.author?.username || "Anonymous"}</span>
                    </div>
                    <span className="text-[11px] text-[rgb(var(--text-tertiary))]">
                      {new Date(d.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <span className="text-[11px] text-[rgb(var(--text-tertiary))]">·</span>
                    <button
                      onClick={() => setReplyingTo(replyingTo === d._id ? null : d._id)}
                      className="text-[11px] text-[rgb(var(--color-primary))] font-medium hover:underline"
                    >
                      {d.answers?.length || 0} answers
                    </button>
                  </div>

                  {/* Reply form inline */}
                  {replyingTo === d._id && (
                    <div className="mt-3 flex gap-2">
                      <Avatar name={currentUser?.username || "U"} size="sm" />
                      <div className="flex-1 flex gap-2">
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a helpful answer..."
                          className="input-base flex-1 text-xs py-2"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReplySubmit(d._id); } }}
                        />
                        <button
                          onClick={() => handleReplySubmit(d._id)}
                          disabled={replySubmitting || !replyText.trim()}
                          className="px-3 py-2 rounded-lg bg-[rgb(var(--color-primary))] text-white text-xs font-semibold hover:bg-[rgb(var(--color-primary-hover))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {replySubmitting ? "..." : "Reply"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Answers preview */}
                  {(d.answers || []).slice(0, 2).map((ans) => (
                    <div key={ans._id}
                      className="mt-3 p-3 bg-[rgb(var(--bg-base))] dark:bg-[rgb(var(--bg-elevated))] rounded-xl border border-[rgb(var(--border-default))]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Avatar name={ans.author?.username || "U"} size="sm" />
                        <span className="text-[11px] font-semibold text-[rgb(var(--text-primary))]">{ans.author?.username || "Anonymous"}</span>
                        <span className="text-[10px] text-[rgb(var(--text-tertiary))]">·</span>
                        <span className="text-[10px] text-[rgb(var(--text-tertiary))]">
                          {new Date(ans.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">{ans.content}</p>
                    </div>
                  ))}
                  {(d.answers || []).length > 2 && (
                    <button className="mt-2 text-[11px] text-indigo-500 font-semibold hover:underline">
                      View all {d.answers.length} answers →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAskModal(false); }}>
          <div className="w-full max-w-lg bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[rgb(var(--text-primary))]">Ask a question</h2>
                <button onClick={() => setShowAskModal(false)}
                  className="w-7 h-7 rounded-lg bg-[rgb(var(--bg-hover))] flex items-center justify-center text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                  ✕
                </button>
              </div>
              <form onSubmit={handleAskSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[rgb(var(--text-secondary))] mb-1.5">Question *</label>
                  <input
                    value={askForm.question}
                    onChange={(e) => setAskForm((f) => ({ ...f, question: e.target.value }))}
                    placeholder="What's your question?"
                    className="input-base"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[rgb(var(--text-secondary))] mb-1.5">Category</label>
                  <select
                    value={askForm.category}
                    onChange={(e) => setAskForm((f) => ({ ...f, category: e.target.value }))}
                    className="input-base"
                  >
                    {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[rgb(var(--text-secondary))] mb-1.5">Description (optional)</label>
                  <textarea
                    value={askForm.description}
                    onChange={(e) => setAskForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Add more context..."
                    className="input-base resize-none h-20"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowAskModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[rgb(var(--border-default))] text-sm font-semibold text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-[rgb(var(--color-primary))] text-white text-sm font-semibold hover:bg-[rgb(var(--color-primary-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting ? "Posting..." : "Post question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}