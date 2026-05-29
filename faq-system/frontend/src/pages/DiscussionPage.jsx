import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const CATEGORIES = [
  { name: "About the Internship", icon: "🏢", hue: "indigo" },
  { name: "Timing and Dates", icon: "📅", hue: "emerald" },
  { name: "NOC", icon: "📋", hue: "amber" },
  { name: "Selection and Offer Letter", icon: "🎓", hue: "purple" },
  { name: "Work and Mentorship", icon: "💼", hue: "rose" },
  { name: "Communication Channels", icon: "💬", hue: "pink" },
  { name: "Interviews", icon: "🎯", hue: "blue" },
  { name: "Certificate", icon: "📜", hue: "teal" },
  { name: "Rosetta", icon: "🪨", hue: "orange" },
  { name: "Phase 1 and Coursework", icon: "📚", hue: "cyan" },
  { name: "Yaksha Chat", icon: "💭", hue: "lime" },
  { name: "ViBe Platform", icon: "🎨", hue: "fuchsia" },
  { name: "Team Formation", icon: "👥", hue: "yellow" },
];

const HUE_STYLE = {
  indigo: ["from-indigo-500 to-blue-500", "bg-indigo-50", "text-indigo-600", "border-indigo-200"],
  emerald: ["from-emerald-500 to-teal-500", "bg-emerald-50", "text-emerald-600", "border-emerald-200"],
  amber: ["from-amber-500 to-orange-500", "bg-amber-50", "text-amber-600", "border-amber-200"],
  purple: ["from-purple-500 to-fuchsia-500", "bg-purple-50", "text-purple-600", "border-purple-200"],
  rose: ["from-rose-500 to-pink-500", "bg-rose-50", "text-rose-600", "border-rose-200"],
  pink: ["from-pink-500 to-rose-500", "bg-pink-50", "text-pink-600", "border-pink-200"],
  blue: ["from-blue-500 to-cyan-500", "bg-blue-50", "text-blue-600", "border-blue-200"],
  teal: ["from-teal-500 to-green-500", "bg-teal-50", "text-teal-600", "border-teal-200"],
  orange: ["from-orange-500 to-amber-500", "bg-orange-50", "text-orange-600", "border-orange-200"],
  cyan: ["from-cyan-500 to-blue-500", "bg-cyan-50", "text-cyan-600", "border-cyan-200"],
  lime: ["from-lime-500 to-green-500", "bg-lime-50", "text-lime-600", "border-lime-200"],
  fuchsia: ["from-fuchsia-500 to-purple-500", "bg-fuchsia-50", "text-fuchsia-600", "border-fuchsia-200"],
  yellow: ["from-yellow-500 to-amber-500", "bg-yellow-50", "text-yellow-700", "border-yellow-200"],
};

const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  answered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  approved: "bg-blue-50 text-blue-600 border-blue-200",
  rejected: "bg-slate-100 text-slate-500 border-slate-200",
  unanswered: "bg-red-50 text-red-500 border-red-200",
};

const AVATAR_COLORS = [
  "from-violet-500 to-purple-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-pink-500",
];

function Avatar({ username, index }) {
  const c = AVATAR_COLORS[(index || 0) % AVATAR_COLORS.length];
  return (
    <div className={"w-9 h-9 rounded-xl bg-gradient-to-br " + c + " flex items-center justify-center text-white text-xs font-extrabold shadow-sm shrink-0"}>
      {(username || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

function FilterChip({ label, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
          : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

export default function DiscussionPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState("recent");
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyForms, setReplyForms] = useState({});
  const [replyTexts, setReplyTexts] = useState({});

  const [newQuestion, setNewQuestion] = useState({ title: "", content: "", category: "" });

  const catRef = useRef(categoryFilter);
  const sortRef = useRef(sortBy);
  catRef.current = categoryFilter;
  sortRef.current = sortBy;

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategoryFilter(cat);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (catRef.current) params.category = catRef.current;
    api.get("/discussions", { params })
      .then((r) => setDiscussions(r.data))
      .catch(() => setDiscussions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = discussions
    .filter((d) => {
      if (activeTab === "mine") return currentUser && d.author?._id === currentUser._id;
      if (activeTab === "unanswered") return d.status === "unanswered";
      if (activeTab === "answered") return d.status === "answered";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "upvotes") return (b.upvotes || 0) - (a.upvotes || 0);
      if (sortBy === "answers") return (b.answers?.length || 0) - (a.answers?.length || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getCatStyle = (name) => {
    const cat = CATEGORIES.find((c) => c.name === name);
    return cat ? HUE_STYLE[cat.hue] || HUE_STYLE.indigo : HUE_STYLE.indigo;
  };

  function formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  function handleUpvote(id) {
    if (!currentUser) { navigate("/login"); return; }
    api.patch("/discussions/" + id + "/upvote")
      .then(() => setDiscussions((prev) => prev.map((d) => d._id === id ? { ...d, upvotes: (d.upvotes || 0) + 1 } : d)))
      .catch(() => {});
  }

  function handleDownvote(id) {
    if (!currentUser) { navigate("/login"); return; }
    api.patch("/discussions/" + id + "/downvote")
      .then(() => setDiscussions((prev) => prev.map((d) => d._id === id ? { ...d, downvotes: (d.downvotes || 0) + 1 } : d)))
      .catch(() => {});
  }

  function openReplyForm(id) {
    const isOpen = replyForms[id];
    setReplyForms((f) => ({ ...f, [id]: !isOpen }));
    if (!replyTexts[id]) setReplyTexts((t) => ({ ...t, [id]: "" }));
  }

  function submitReply(discussionId) {
    if (!currentUser) { navigate("/login"); return; }
    const text = replyTexts[discussionId]?.trim();
    if (!text) return;
    api.post("/discussions/" + discussionId + "/answers", { content: text })
      .then((r) => {
        setDiscussions((prev) => prev.map((d) => d._id === discussionId ? { ...d, answers: [...(d.answers || []), r.data] } : d));
        setReplyTexts((t) => ({ ...t, [discussionId]: "" }));
        setReplyForms((f) => ({ ...f, [discussionId]: false }));
      })
      .catch(() => {});
  }

  function handleAskQuestion() {
    if (!currentUser) { navigate("/login"); return; }
    if (!newQuestion.title.trim() || !newQuestion.content.trim() || !newQuestion.category) return;
    api.post("/discussions", newQuestion)
      .then(() => {
        setAskModalOpen(false);
        setNewQuestion({ title: "", content: "", category: "" });
        api.get("/discussions").then((r) => setDiscussions(r.data));
      })
      .catch(() => {});
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-5 pb-28 md:pb-10">
      <div className="flex gap-6">

        {/* ── Left Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 sticky top-20 self-start gap-1">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-2">Topics</p>
          <button onClick={() => { setCategoryFilter(""); setSearchParams({}); }}
            className={"flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left " + (!categoryFilter ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:bg-slate-100")}>
            🌐 All
          </button>
          {CATEGORIES.map((cat) => {
            const [g, b, t] = getCatStyle(cat.name);
            return (
              <button key={cat.name} onClick={() => { setCategoryFilter(cat.name); setSearchParams({ category: cat.name }); }}
                className={"flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left " + (
                  categoryFilter === cat.name ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:bg-slate-100"
                )}>
                <span className="text-base w-6 text-center">{cat.icon}</span>
                <span className="flex-1 truncate text-xs">{cat.name}</span>
              </button>
            );
          })}
        </aside>

        {/* ── Main Feed ── */}
        <main className="flex-1 min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">Discussions</h1>
              <p className="text-sm text-slate-500 mt-0.5">{filtered.length} thread{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={() => currentUser ? setAskModalOpen(true) : navigate("/login")}
              className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
            >
              ✍️ <span className="hidden sm:inline">Ask</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-5">
            <FilterChip label="All" icon="🌐" active={activeTab === "all"} onClick={() => setActiveTab("all")} />
            <FilterChip label="Mine" icon="👤" active={activeTab === "mine"} onClick={() => setActiveTab("mine")} />
            <FilterChip label="Unanswered" icon="❓" active={activeTab === "unanswered"} onClick={() => setActiveTab("unanswered")} />
            <FilterChip label="Answered" icon="✅" active={activeTab === "answered"} onClick={() => setActiveTab("answered")} />
            <div className="ml-auto flex items-center gap-1.5">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-slate-200 rounded-full px-3 py-1.5 bg-white text-slate-600 cursor-pointer focus:outline-none focus:ring-2 focus:"
              >
                <option value="recent">🔥 Recent</option>
                <option value="upvotes">👍 Top</option>
                <option value="answers">💬 Most answered</option>
              </select>
            </div>
          </div>

          {/* Discussion feed */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => <div key={n} className="h-36 bg-slate-200 rounded-2xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-slate-700 font-bold text-lg mb-1">No discussions yet</p>
              <p className="text-slate-400 text-sm mb-6">Be the first to start a conversation!</p>
              <button onClick={() => setAskModalOpen(true)} className="btn-primary px-6 py-2.5 text-sm">✍️ Ask a Question</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((d, idx) => {
                const catStyle = getCatStyle(d.category);
                const catMeta = CATEGORIES.find((c) => c.name === d.category);
                const isExpanded = expandedId === d._id;
                const replyOpen = !!replyForms[d._id];

                return (
                  <div key={d._id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden social-card animate-slideUp"
                    style={{ animationDelay: idx * 35 + "ms" }}
                  >
                    {/* Card top */}
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <Avatar username={d.author?.username} index={idx} />

                        <div className="flex-1 min-w-0">
                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-slate-800">{d.author?.username || "Anonymous"}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-400">{formatTime(d.createdAt)}</span>
                            <span className={"text-xs font-semibold px-2 py-0.5 rounded-lg border " + catStyle[3] + " " + catStyle[1] + " " + catStyle[2]}>
                              {catMeta?.icon} {d.category}
                            </span>
                            {d.status && (
                              <span className={"text-xs font-semibold px-2 py-0.5 rounded-lg border " + (STATUS_COLORS[d.status] || STATUS_COLORS.pending)}>
                                {d.status}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <button className="w-full text-left" onClick={() => setExpandedId(isExpanded ? null : d._id)}>
                            <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5">{d.title}</h3>
                            {d.content && (
                              <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{d.content}</p>
                            )}
                          </button>

                          {/* Action row */}
                          <div className="flex items-center gap-3 mt-4">
                            {/* Upvote */}
                            <button onClick={() => handleUpvote(d._id)}
                              className={"vote-btn up " + (false ? "voted" : "")}>
                              <span className="text-sm">👍</span>
                              <span className="count">{d.upvotes || 0}</span>
                            </button>
                            {/* Downvote */}
                            <button onClick={() => handleDownvote(d._id)} className="vote-btn">
                              <span className="text-sm">👎</span>
                              <span className="count">{d.downvotes || 0}</span>
                            </button>
                            {/* Reply toggle */}
                            <button onClick={() => openReplyForm(d._id)}
                              className={"flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all " + (replyOpen ? "bg-indigo-50 border-indigo-300 text-indigo-600" : "text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600")}>
                              💬 {d.answers?.length || 0}
                            </button>
                            {/* Expand */}
                            <button onClick={() => setExpandedId(isExpanded ? null : d._id)}
                              className="ml-auto flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
                              {isExpanded ? "▲ Hide" : "▼ Show answers"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded answers */}
                    {isExpanded && (
                      <div className="px-5 pb-5 animate-slideDown">
                        <div className="h-px bg-slate-100 mb-4" />

                        {/* Reply form */}
                        {currentUser && (
                          <div className="flex gap-3 mb-5">
                            <Avatar username={currentUser.username} index={99} />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={replyTexts[d._id] || ""}
                                onChange={(e) => setReplyTexts((t) => ({ ...t, [d._id]: e.target.value }))}
                                placeholder="Write a reply..."
                                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition-all"
                                onKeyDown={(e) => e.key === "Enter" && submitReply(d._id)}
                              />
                              <button onClick={() => submitReply(d._id)}
                                className="btn-primary px-4 py-2 text-sm rounded-xl">
                                Reply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Answers */}
                        {d.answers?.length > 0 ? (
                          <div className="space-y-3">
                            {d.answers
                              .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
                              .map((ans, ai) => (
                                <div key={ans._id} className="flex gap-3">
                                  <Avatar username={ans.author?.username} index={ai + 1} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-bold text-slate-800">{ans.author?.username || "Anonymous"}</span>
                                      <span className="text-xs text-slate-400">·</span>
                                      <span className="text-xs text-slate-400">{formatTime(ans.createdAt)}</span>
                                      <span className="text-xs font-semibold text-amber-500 ml-1">🔥 {ans.upvotes || 0}</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl px-4 py-3">
                                      <p className="text-sm text-slate-700 leading-relaxed">{ans.content}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-sm">No replies yet. Be the first!</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Ask Question Modal ── */}
      {askModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAskModalOpen(false); }}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-popIn" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-slate-900">Ask the Community</h2>
                <button onClick={() => setAskModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 block">Topic</label>
                  <select value={newQuestion.category} onChange={(e) => setNewQuestion((q) => ({ ...q, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select a topic...</option>
                    {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 block">Question</label>
                  <input type="text" value={newQuestion.title} onChange={(e) => setNewQuestion((q) => ({ ...q, title: e.target.value }))}
                    placeholder="What's your question?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 block">Details (optional)</label>
                  <textarea value={newQuestion.content} onChange={(e) => setNewQuestion((q) => ({ ...q, content: e.target.value }))}
                    placeholder="Add more context..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white transition-all" />
                </div>
                <button onClick={handleAskQuestion}
                  className="w-full py-3.5 btn-primary text-sm">
                  💬 Post Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}