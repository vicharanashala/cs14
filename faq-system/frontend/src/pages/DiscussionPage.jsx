import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const CATEGORIES = [
  { name: "About the Internship", icon: "🏢", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-700" },
  { name: "Timing and Dates", icon: "📅", color: "from-green-500 to-green-600", bg: "bg-green-50", text: "text-green-700" },
  { name: "NOC", icon: "📋", color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-50", text: "text-yellow-700" },
  { name: "Selection and Offer Letter", icon: "🎓", color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-700" },
  { name: "Work and Mentorship", icon: "💼", color: "from-red-500 to-red-600", bg: "bg-red-50", text: "text-red-700" },
  { name: "Communication Channels", icon: "💬", color: "from-pink-500 to-pink-600", bg: "bg-pink-50", text: "text-pink-700" },
  { name: "Interviews", icon: "🎯", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-700" },
  { name: "Certificate", icon: "📜", color: "from-teal-500 to-teal-600", bg: "bg-teal-50", text: "text-teal-700" },
  { name: "Rosetta", icon: "🪨", color: "from-orange-500 to-orange-600", bg: "bg-orange-50", text: "text-orange-700" },
  { name: "Phase 1 and Coursework", icon: "📚", color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", text: "text-cyan-700" },
  { name: "Yaksha Chat", icon: "💭", color: "from-lime-500 to-lime-600", bg: "bg-lime-50", text: "text-lime-700" },
  { name: "ViBe Platform", icon: "🎨", color: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-700" },
  { name: "Team Formation", icon: "👥", color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-700" },
];

const STATUS_COLORS = {
  unanswered: "bg-red-50 text-red-600 border border-red-200",
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  answered: "bg-green-50 text-green-600 border border-green-200",
  approved: "bg-blue-50 text-blue-600 border border-blue-200",
  rejected: "bg-slate-100 text-slate-500 border border-slate-200",
};

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent", icon: "🕐" },
  { label: "Most Upvoted", value: "upvotes", icon: "🔥" },
  { label: "Unanswered", value: "unanswered", icon: "❓" },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-100 rounded w-full mb-2" />
      <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-slate-100 rounded-full w-20" />
        <div className="h-5 bg-slate-100 rounded-full w-16" />
      </div>
    </div>
  );
}

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", description: "", category: "About the Internship" });
  const [formErrors, setFormErrors] = useState({ title: "", description: "" });
  const [expandedId, setExpandedId] = useState(null);
  const [answerInputs, setAnswerInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [voteErrors, setVoteErrors] = useState({});
  const [submittingAnswer, setSubmittingAnswer] = useState({});
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const categoryRef = useRef(selectedCategory);
  const searchRef = useRef(searchQuery);
  const sortRef = useRef(sortBy);

  useEffect(() => { categoryRef.current = selectedCategory; }, [selectedCategory]);
  useEffect(() => { searchRef.current = searchQuery; }, [searchQuery]);
  useEffect(() => { sortRef.current = sortBy; }, [sortBy]);

  const fetchDiscussions = () => {
    setLoading(true);
    const params = {};
    const cat = categoryRef.current;
    const sq = searchRef.current;
    const sb = sortRef.current;

    if (cat !== "All") params.category = cat;
    if (sq.trim()) params.search = sq.trim();
    if (sb === "upvotes") params.sort = "upvotes";
    else if (sb === "unanswered") params.sort = "unanswered";

    api.get("/discussions", { params })
      .then((res) => { setDiscussions(res.data); })
      .catch((err) => { console.error(err); })
      .finally(() => { setLoading(false); });
  };

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.some((c) => c.name === cat)) {
      setSelectedCategory(cat);
      categoryRef.current = cat;
    }
  }, []);

  useEffect(() => { fetchDiscussions(); }, [selectedCategory, sortBy]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    categoryRef.current = cat;
    setSearchQuery("");
    searchRef.current = "";
    setSortBy("recent");
    sortRef.current = "recent";
  };

  const handleSearch = () => {
    searchRef.current = searchQuery;
    fetchDiscussions();
  };

  const handleUpvote = (id) => {
    if (!currentUser) return;
    api.patch("/discussions/" + id + "/upvote").then((res) => {
      setDiscussions((prev) => prev.map((d) => d._id === id ? { ...d, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : d));
      setVoteErrors((prev) => ({ ...prev, [id]: "" }));
    }).catch((err) => {
      setVoteErrors((prev) => ({ ...prev, [id]: err.response?.status === 400 ? "Already voted" : "Failed to upvote" }));
    });
  };

  const handleDownvote = (id) => {
    if (!currentUser) return;
    api.patch("/discussions/" + id + "/downvote").then((res) => {
      setDiscussions((prev) => prev.map((d) => d._id === id ? { ...d, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : d));
      setVoteErrors((prev) => ({ ...prev, [id]: "" }));
    }).catch((err) => {
      setVoteErrors((prev) => ({ ...prev, [id]: err.response?.status === 400 ? "Already voted" : "Failed to downvote" }));
    });
  };

  const handleSubmitAnswer = (discussionId) => {
    const content = answerInputs[discussionId]?.trim();
    if (!content) return;
    setSubmittingAnswer((p) => ({ ...p, [discussionId]: true }));
    api.post("/discussions/" + discussionId + "/answers", { content })
      .then(() => {
        setAnswerInputs((p) => ({ ...p, [discussionId]: "" }));
        fetchDiscussions();
      })
      .catch(() => {})
      .finally(() => setSubmittingAnswer((p) => ({ ...p, [discussionId]: false })));
  };

  const handleSubmitComment = (discussionId) => {
    const content = commentInputs[discussionId]?.trim();
    if (!content) return;
    api.post("/discussions/" + discussionId + "/comments", { content })
      .then(() => {
        setCommentInputs((p) => ({ ...p, [discussionId]: "" }));
        fetchDiscussions();
      });
  };

  const handleAddQuestion = () => {
    const errors = { title: "", description: "" };
    if (!newQuestion.title.trim()) errors.title = "Title is required";
    if (!newQuestion.description.trim()) errors.description = "Description is required";
    if (errors.title || errors.description) { setFormErrors(errors); return; }
    api.post("/discussions", newQuestion)
      .then(() => {
        setShowAddModal(false);
        setNewQuestion({ title: "", description: "", category: "About the Internship" });
        setFormErrors({ title: "", description: "" });
        fetchDiscussions();
      })
      .catch(() => {});
  };

  const hasVerifiedAnswer = (d) => d.answers?.some((a) => a.isVerified);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 p-5 shrink-0 flex-col">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
        <nav className="space-y-1 flex-1">
          <button onClick={() => handleCategoryClick("All")}
            className={"w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 " + (
              selectedCategory === "All" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}>
            <span>🌐</span><span>All Categories</span>
            {selectedCategory === "All" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
          </button>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button key={cat.name} onClick={() => handleCategoryClick(cat.name)}
                className={"w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 " + (
                  isActive
                    ? "bg-gradient-to-r " + cat.color + " text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                )}>
                <span className="text-base">{cat.icon}</span>
                <span className="flex-1 leading-tight">{cat.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-200 space-y-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all">
            🏠 <span>Home</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-base shadow-sm">💬</div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Discussions</h1>
                <p className="text-xs text-slate-400">{discussions.length} thread{discussions.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {currentUser && (
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-500/30 active:scale-95">
                <span>✏️</span><span>Ask Question</span>
              </button>
            )}
          </div>

          {/* Search + Sort */}
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search discussions..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition-all"
              />
            </div>
            <button onClick={handleSearch} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95">
              Search
            </button>

            {/* Sort Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSortBy(opt.value)}
                  className={"px-3 py-2 text-xs font-semibold rounded-lg transition-all " + (
                    sortBy === opt.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}>
                  <span className="mr-1">{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>

            {/* Mobile Category Picker */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryClick(e.target.value)}
              className="lg:hidden px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All</option>
              {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </header>

        {/* Discussion List */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 4, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : discussions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-slate-500 font-medium text-lg mb-2">No discussions found</p>
              <p className="text-slate-400 text-sm mb-4">
                {selectedCategory !== "All" ? "No threads in this category yet" : "Be the first to start a discussion!"}
              </p>
              {currentUser && (
                <button onClick={() => setShowAddModal(true)} className="text-indigo-600 font-semibold text-sm hover:underline">
                  + Ask the first question
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discussions.map((d) => {
                const catMeta = CATEGORIES.find((c) => c.name === d.category);
                const verified = hasVerifiedAnswer(d);
                return (
                  <div key={d._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden faq-card">
                    <div className="p-5">
                      {/* Category + Status row */}
                      <div className="flex items-center gap-2 mb-3">
                        {catMeta && (
                          <span className={"text-xs font-medium px-2.5 py-1 rounded-lg " + catMeta.bg + " " + catMeta.text}>
                            {catMeta.icon} {d.category}
                          </span>
                        )}
                        <StatusBadge status={d.status} />
                        {verified && (
                          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg bg-green-100 text-green-700">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      {/* Title + Description */}
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">{d.title}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{d.description}</p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>👤</span><span>{d.author?.username || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                          <span>💬</span><span>{d.answers?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <span>📅</span><span>{formatDate(d.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Section */}
                    <div className="border-t border-slate-100">
                      <button onClick={() => setExpandedId(expandedId === d._id ? null : d._id)}
                        className="w-full px-5 py-3 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-between">
                        <span>{expandedId === d._id ? "Hide Discussion" : "View Discussion"}</span>
                        <span className={expandedId === d._id ? "rotate-180" : ""}>▼</span>
                      </button>

                      {expandedId === d._id && (
                        <div className="px-5 pb-5 space-y-4">
                          {/* Description */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{d.description}</p>
                          </div>

                          {/* Answers */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Answers {d.answers?.length > 0 && "(" + d.answers.length + ")"}
                            </p>
                            {d.answers?.length > 0 ? (
                              <div className="space-y-2">
                                {d.answers.map((ans) => (
                                  <div key={ans._id} className={"p-3 rounded-xl border " + (ans.isVerified ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50")}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-slate-700">{ans.author?.username || "Unknown"}</span>
                                      {ans.isVerified && <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800">✓</span>}
                                      <span className="text-xs text-slate-400 ml-auto">{formatDate(ans.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{ans.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 text-center">No answers yet</p>
                            )}

                            {currentUser && (
                              <div className="mt-3 flex gap-2">
                                <textarea
                                  value={answerInputs[d._id] || ""}
                                  onChange={(e) => setAnswerInputs((p) => ({ ...p, [d._id]: e.target.value }))}
                                  placeholder="Write your answer..."
                                  rows={2}
                                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-slate-50"
                                />
                                <button
                                  onClick={() => handleSubmitAnswer(d._id)}
                                  disabled={submittingAnswer[d._id] || !answerInputs[d._id]?.trim()}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all self-start disabled:opacity-50 active:scale-95">
                                  {submittingAnswer[d._id] ? "..." : "Reply"}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Comments */}
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Comments {d.comments?.length > 0 && "(" + d.comments.length + ")"}
                            </p>
                            {d.comments?.length > 0 ? (
                              <div className="space-y-1.5">
                                {d.comments.map((cmt) => (
                                  <div key={cmt._id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-slate-600">{cmt.author?.username || "Unknown"}</span>
                                      <span className="text-xs text-slate-400">{formatDate(cmt.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{cmt.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">No comments yet</p>
                            )}

                            {currentUser && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  value={commentInputs[d._id] || ""}
                                  onChange={(e) => setCommentInputs((p) => ({ ...p, [d._id]: e.target.value }))}
                                  placeholder="Add a comment..."
                                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                                />
                                <button onClick={() => handleSubmitComment(d._id)}
                                  className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded-lg transition-all active:scale-95">
                                  💬
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Vote buttons */}
                          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleUpvote(d._id)} disabled={!currentUser}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-700 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                👍 {d.upvotes}
                              </button>
                              <button onClick={() => handleDownvote(d._id)} disabled={!currentUser}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                👎 {d.downvotes}
                              </button>
                            </div>
                            {voteErrors[d._id] && (
                              <p className="text-xs text-red-500">{voteErrors[d._id]}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-base shadow-sm">✏️</div>
                  <h2 className="text-xl font-bold text-slate-800">Ask a Question</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl transition-colors">✕</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Summarize your question clearly"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all"
                  />
                  {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    value={newQuestion.description}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your question in detail..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all resize-none"
                  />
                  {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setShowAddModal(false); setFormErrors({ title: "", description: "" }); }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleAddQuestion}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                  Submit Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}