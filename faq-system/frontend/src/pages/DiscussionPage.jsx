import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../context/CategoryContext";
import { toast } from "../components/Toast";
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, ThumbsUp, ThumbsDown, MessageCircle, AlertTriangle, X, Search, CheckCircle } from "lucide-react";

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
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : size === "lg" ? "w-10 h-10 text-base" : "w-8 h-8 text-xs";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0 shadow-sm font-display`}>
      {(name || "U")[0].toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    unanswered: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    pending: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    answered: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

export default function DiscussionPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useCategories();
  const finalCategories = ["All", ...categories.map(c => c.name)];

  const getCategoryDesc = (catName) => {
    if (catName === "All") return "All student questions, answers, and comments.";
    const found = categories.find(c => c.name === catName);
    return found?.description || `Discussions and FAQs regarding ${catName}`;
  };

  const [discussions, setDiscussions] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");

  // Modal and accordion
  const [showAskModal, setShowAskModal] = useState(false);
  const [askForm, setAskForm] = useState({ title: "", category: "About the Internship", description: "" });
  const [submitting, setSubmitting] = useState(false);

  // Accordion state
  const [expandedId, setExpandedId] = useState(null);

  // Reply/Comment input fields (keyed by discussion ID)
  const [replyTexts, setReplyTexts] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [replySubmitting, setReplySubmitting] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});

  // Parse category from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get("category");
    if (catParam && finalCategories.includes(catParam)) {
      setCategory(catParam);
    }
  }, [location.search, categories]);

  // Load all discussions & FAQs
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [discRes, faqRes] = await Promise.all([
        api.get("/discussions"),
        api.get("/faqs?limit=200")
      ]);
      setDiscussions(Array.isArray(discRes.data) ? discRes.data : (discRes.data?.data || []));
      setAllFaqs(Array.isArray(faqRes.data) ? faqRes.data : (faqRes.data?.data || []));
    } catch {
      toast({ type: "error", message: "Failed to load discussions data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute counters dynamically based on ALL discussions
  const counts = { All: discussions.length };
  finalCategories.forEach(c => {
    if (c !== "All") {
      counts[c] = discussions.filter(d => d.category === c).length;
    }
  });

  // Filter & Sort
  const filtered = discussions.filter(d => {
    const matchesCat = category === "All" || d.category === category;
    const matchesSearch = !searchQuery.trim() ||
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sort === "votes") return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
    if (sort === "unanswered") {
      // Unanswered first, then newest
      const aVal = a.status === "unanswered" ? 1 : 0;
      const bVal = b.status === "unanswered" ? 1 : 0;
      if (bVal !== aVal) return bVal - aVal;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return 0;
  });

  // Upvote/Downvote actions
  const handleVote = async (id, type) => {
    if (!currentUser) { navigate("/login"); return; }
    try {
      const res = await api.patch(`/discussions/${id}/${type}`);
      setDiscussions(prev => prev.map(d => d._id === id ? { ...d, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : d));
      toast({ type: "success", message: `Vote recorded!` });
    } catch (err) {
      toast({ type: "error", message: err.response?.data?.message || `Failed to vote` });
    }
  };

  // Add Answer
  const handleAddAnswer = async (e, dId) => {
    e.preventDefault();
    if (!currentUser) { navigate("/login"); return; }
    const content = replyTexts[dId] || "";
    if (!content.trim()) return;

    setReplySubmitting(prev => ({ ...prev, [dId]: true }));
    try {
      await api.post(`/discussions/${dId}/answers`, { content });
      setReplyTexts(prev => ({ ...prev, [dId]: "" }));
      toast({ type: "success", message: "Answer submitted!" });
      fetchAllData();
    } catch {
      toast({ type: "error", message: "Failed to submit answer" });
    } finally {
      setReplySubmitting(prev => ({ ...prev, [dId]: false }));
    }
  };

  // Add Comment
  const handleAddComment = async (e, dId) => {
    e.preventDefault();
    if (!currentUser) { navigate("/login"); return; }
    const content = commentTexts[dId] || "";
    if (!content.trim()) return;

    setCommentSubmitting(prev => ({ ...prev, [dId]: true }));
    try {
      await api.post(`/discussions/${dId}/comments`, { content });
      setCommentTexts(prev => ({ ...prev, [dId]: "" }));
      toast({ type: "success", message: "Comment added!" });
      fetchAllData();
    } catch {
      toast({ type: "error", message: "Failed to add comment" });
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [dId]: false }));
    }
  };

  useEffect(() => {
    if (showAskModal) {
      setAskForm({
        title: "",
        category: category !== "All" ? category : (categories[0]?.name || "About the Internship"),
        description: ""
      });
    }
  }, [showAskModal, category, categories]);

  // Submit Query
  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { navigate("/login"); return; }
    if (!askForm.title.trim() || !askForm.description.trim()) {
      toast({ type: "warning", message: "Please fill in all fields" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/discussions", {
        title: askForm.title,
        description: askForm.description,
        category: askForm.category,
      });
      toast({ type: "success", message: "Discussion query posted!" });
      setShowAskModal(false);
      setAskForm({ title: "", category: categories[0]?.name || "About the Internship", description: "" });
      fetchAllData();
    } catch {
      toast({ type: "error", message: "Failed to post question" });
    } finally {
      setSubmitting(false);
    }
  };

  // Live Jaccard Similarity Warning Logic
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  useEffect(() => {
    if (!askForm.title.trim() || askForm.title.length < 5) {
      setDuplicateMatches([]);
      return;
    }

    const titleLower = askForm.title.toLowerCase();
    const matches = [];

    const getJaccard = (s1, s2) => {
      const w1 = new Set(s1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const w2 = new Set(s2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      if (w1.size === 0 || w2.size === 0) return 0;
      const inter = new Set([...w1].filter(x => w2.has(x)));
      const union = new Set([...w1, ...w2]);
      return inter.size / union.size;
    };

    // Check FAQs
    allFaqs.forEach(f => {
      const score = getJaccard(titleLower, f.question);
      if (score >= 0.2) {
        matches.push({ id: f._id, type: "faq", title: f.question, category: f.category, score });
      }
    });

    // Check Discussions
    discussions.forEach(d => {
      const score = getJaccard(titleLower, d.title || d.question);
      if (score >= 0.2) {
        matches.push({ id: d._id, type: "discussion", title: d.title || d.question, category: d.category, score });
      }
    });

    // Sort by highest score first
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    setDuplicateMatches(sortedMatches.slice(0, 3));
  }, [askForm.title, allFaqs, discussions]);

  return (
    <div className="min-h-screen pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black font-display text-[rgb(var(--text-primary))]">Category Dialogues</h1>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">Participate in specific category support discussions.</p>
        </div>
        <button
          onClick={() => currentUser ? setShowAskModal(true) : navigate("/login")}
          className="w-full sm:w-auto px-4 py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))] transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <HelpCircle size={14} />
          Add Query
        </button>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Vertical Category Selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-3.5 bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border-default))]">
              <span className="text-[10px] font-bold font-display uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                Modules & Categories
              </span>
            </div>
            <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
              {finalCategories.map(cat => {
                const isActive = category === cat;
                const count = counts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      navigate(`/discussions?category=${encodeURIComponent(cat)}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))] border-l-4 border-[rgb(var(--color-primary))]"
                        : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"
                    }`}
                  >
                    <span className="truncate mr-1">{cat}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-[rgb(var(--color-primary))] text-white" : "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-tertiary))]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Main Feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Feed Header Panel */}
          <div className="bg-[rgb(var(--bg-surface))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm">
            <h2 className="text-lg font-bold font-display text-[rgb(var(--text-primary))]">{category} discussions</h2>
            <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">{getCategoryDesc(category)}</p>

            {/* Keyword Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
              <div className="relative w-full sm:flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Filter discussions by keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[rgb(var(--bg-base))] border border-[rgb(var(--border-strong))] rounded-xl outline-none focus:border-[rgb(var(--color-primary))] text-[rgb(var(--text-primary))]"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex gap-1.5 bg-[rgb(var(--bg-base))] p-1 rounded-xl border border-[rgb(var(--border-default))]">
                <button
                  onClick={() => setSort("newest")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-display transition-all ${
                    sort === "newest" ? "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))] shadow-sm" : "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSort("votes")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-display transition-all ${
                    sort === "votes" ? "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))] shadow-sm" : "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
                  }`}
                >
                  Most Upvoted
                </button>
                <button
                  onClick={() => setSort("unanswered")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-display transition-all ${
                    sort === "unanswered" ? "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))] shadow-sm" : "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
                  }`}
                >
                  Unanswered
                </button>
              </div>
            </div>
          </div>

          {/* Discussion Accordion Cards Feed */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-12 text-center">
              <span className="text-3xl">💬</span>
              <h3 className="text-sm font-bold font-display text-[rgb(var(--text-primary))] mt-2">No discussions found</h3>
              <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">Be the first to post a query in this category!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map(d => {
                const isExpanded = expandedId === d._id;
                const dateStr = new Date(d.createdAt || Date.now()).toLocaleString("en-IN", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                });

                return (
                  <div
                    key={d._id}
                    className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl overflow-hidden shadow-sm hover:border-[rgb(var(--border-strong))] transition-all"
                  >
                    {/* Header summary section */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : d._id)}
                      className="p-5 cursor-pointer hover:bg-[rgb(var(--bg-hover))] transition-all flex items-start gap-3.5"
                    >
                      <Avatar name={d.author?.username || "Anonymous"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <StatusBadge status={d.status} />
                          <span className="text-[10px] font-bold font-display bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                            {d.category}
                          </span>
                          <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{dateStr}</span>
                        </div>
                        <h4 className="text-sm font-bold font-display text-[rgb(var(--text-primary))] line-clamp-1">{d.title || d.question}</h4>
                        <p className="text-xs text-[rgb(var(--text-secondary))] line-clamp-2 mt-1 leading-relaxed">{d.description}</p>
                      </div>
                      <button className="text-[rgb(var(--text-tertiary))] p-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Expandable Panel */}
                    {isExpanded && (
                      <div className="border-t border-[rgb(var(--border-default))] bg-[rgb(var(--bg-base))] p-5 space-y-5">
                        {/* Question Details Full Description */}
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-1.5">Details</h5>
                          <p className="text-xs text-[rgb(var(--text-primary))] bg-[rgb(var(--bg-surface))] p-4 rounded-xl border border-[rgb(var(--border-default))] leading-relaxed white-space-pre-line">
                            {d.description}
                          </p>
                        </div>

                        {/* Verified & Predefined Answers Panel */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))]">Answers ({d.answers?.length || 0})</h5>
                          {(d.answers || []).length === 0 ? (
                            <p className="text-xs text-[rgb(var(--text-tertiary))] italic pl-2">No answers posted yet. Add your reply below!</p>
                          ) : (
                            <div className="space-y-3">
                              {d.answers.map((ans, aIdx) => (
                                <div key={aIdx} className="p-3 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Avatar name={ans.author?.username || "Coordinator"} size="sm" />
                                      <div>
                                        <p className="text-[11px] font-bold text-[rgb(var(--text-primary))]">{ans.author?.username || "Coordinator"}</p>
                                        <p className="text-[9px] text-[rgb(var(--text-tertiary))]">{new Date(ans.createdAt).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    {ans.isVerified && (
                                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300">
                                        <CheckCircle size={10} /> Verified
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[rgb(var(--text-primary))] pl-8 leading-relaxed">{ans.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-3 border-t border-[rgb(var(--border-default))] pt-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] flex items-center gap-1">
                            <MessageCircle size={12} /> Discussion Comments ({d.comments?.length || 0})
                          </h5>
                          {(d.comments || []).length > 0 && (
                            <div className="space-y-2 pl-4">
                              {d.comments.map((c, cIdx) => (
                                <div key={cIdx} className="flex gap-2 text-xs text-[rgb(var(--text-primary))]">
                                  <span className="font-bold text-[rgb(var(--color-primary))] shrink-0">{c.author?.username || "User"}:</span>
                                  <span className="text-[rgb(var(--text-secondary))] leading-relaxed">{c.content}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Inline Comment Input Form */}
                          <form onSubmit={(e) => handleAddComment(e, d._id)} className="flex gap-2 pl-4">
                            <input
                              type="text"
                              required
                              placeholder="Write a comment..."
                              value={commentTexts[d._id] || ""}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [d._id]: e.target.value }))}
                              className="flex-1 px-3 py-1.5 text-xs bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] rounded-lg outline-none focus:border-[rgb(var(--color-primary))]"
                            />
                            <button
                              type="submit"
                              disabled={commentSubmitting[d._id]}
                              className="px-3 py-1 bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))] text-[10px] font-bold rounded-lg hover:bg-[rgb(var(--bg-hover))]"
                            >
                              Comment
                            </button>
                          </form>
                        </div>

                        {/* Post New Answer Box */}
                        <form onSubmit={(e) => handleAddAnswer(e, d._id)} className="space-y-2 border-t border-[rgb(var(--border-default))] pt-4">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                            Write an Answer
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Provide a detailed answer or explanation..."
                            value={replyTexts[d._id] || ""}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [d._id]: e.target.value }))}
                            className="w-full p-3 text-xs bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] rounded-xl outline-none focus:border-[rgb(var(--color-primary))] resize-none"
                          />
                          <button
                            type="submit"
                            disabled={replySubmitting[d._id]}
                            className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))] transition-colors disabled:opacity-60"
                          >
                            Submit Answer
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Card Footer controls */}
                    <div className="bg-[rgb(var(--bg-base))] px-5 py-2.5 flex items-center justify-between border-t border-[rgb(var(--border-default))]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleVote(d._id, "upvote")}
                          className="flex items-center gap-1 text-[10px] font-semibold text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--color-primary))] transition-all"
                        >
                          <ThumbsUp size={12} /> {d.upvotes || 0}
                        </button>
                        <button
                          onClick={() => handleVote(d._id, "downvote")}
                          className="flex items-center gap-1 text-[10px] font-semibold text-[rgb(var(--text-secondary))] hover:text-red-500 transition-all"
                        >
                          <ThumbsDown size={12} /> {d.downvotes || 0}
                        </button>
                      </div>
                      <span className="text-[10px] font-semibold text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                        <MessageSquare size={11} /> {d.answers?.length || 0} answers
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Query Dialog Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[rgb(var(--bg-surface))] rounded-2xl max-w-xl w-full border border-[rgb(var(--border-strong))] shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[rgb(var(--border-default))] bg-[rgb(var(--bg-base))] flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-[rgb(var(--text-primary))] flex items-center gap-2">
                <span>💬</span> Ask Category Dialogue
              </h3>
              <button onClick={() => setShowAskModal(false)} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] p-1">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAskSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-1 font-display">
                  Query Title (Question)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. When is the NOC signature timeline?"
                  value={askForm.title}
                  onChange={(e) => setAskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full input-base text-xs py-2 px-3"
                />
              </div>

              {/* Jaccard Similarity Warnings */}
              {duplicateMatches.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>AI Duplicate Warning: Similar FAQs Exist</span>
                  </div>
                  <div className="space-y-1.5">
                    {duplicateMatches.map((match, mIdx) => (
                      <div
                        key={mIdx}
                        onClick={() => {
                          setShowAskModal(false);
                          if (match.type === "faq") {
                            navigate(`/faqs/${encodeURIComponent(match.category)}?highlight=${match.id}`);
                          } else {
                            setExpandedId(match.id);
                            setCategory(match.category);
                          }
                        }}
                        className="text-[11px] text-amber-900 dark:text-amber-200 hover:underline cursor-pointer flex items-start gap-1"
                      >
                        <span className="shrink-0">🔗</span>
                        <span className="line-clamp-1">[{match.type.toUpperCase()}] {match.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-1 font-display">
                    Category Module
                  </label>
                  <select
                    value={askForm.category}
                    onChange={(e) => setAskForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full input-base text-xs py-2 px-3"
                  >
                    {categories.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[rgb(var(--text-secondary))] mb-1 font-display">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your issue, include deadlines, errors, or forms to sign..."
                  value={askForm.description}
                  onChange={(e) => setAskForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full input-base text-xs py-2 px-3 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[rgb(var(--border-default))] pt-4">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))] transition-colors disabled:opacity-60"
                >
                  {submitting ? "Posting..." : "Post Query"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}