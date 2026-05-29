import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";

/* ── Helpers ──────────────────────────────────────────────────── */
const CATEGORIES = [
  "About the Internship", "Timing and Dates", "NOC", "Selection and Offer Letter",
  "Work and Mentorship", "Communication Channels", "Interviews", "Certificate", "Rosetta",
  "Phase 1 and Coursework", "Yaksha Chat", "ViBe Platform", "Team Formation",
];

const AVATAR_COLORS = [
  "from-pink-400 to-rose-500", "from-violet-400 to-purple-500", "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500", "from-amber-400 to-orange-500", "from-indigo-400 to-blue-500",
];
function getAvatarColor(name) {
  let hash = 0;
  for (let c of name || "U") hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function Avatar({ name, size = "sm" }) {
  const color = getAvatarColor(name || "U");
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold shrink-0`}>
      {(name || "U")[0].toUpperCase()}
    </div>
  );
}

/* ── Metric Card ─────────────────────────────────────────────── */
function MetricCard({ icon, label, value, sub, color = "indigo" }) {
  const colorMap = {
    indigo: "from-indigo-500 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    emerald: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  };
  return (
    <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-base shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-[rgb(var(--text-primary))]">{value}</p>
      <p className="text-xs font-semibold text-[rgb(var(--text-secondary))] mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-[rgb(var(--text-tertiary))] mt-0.5">{sub}</p>}
    </div>
  );
}

/* ── Verify & Approve Modal ───────────────────────────────────── */
function VerifyApproveModal({ discussion, onClose, onRefresh }) {
  const { currentUser } = useAuth();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!discussion) return null;

  const sortedAnswers = [...(discussion.answers || [])].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

  const handleApprove = async () => {
    if (!selectedAnswer) { toast({ type: "warning", message: "Select an answer to approve" }); return; }
    setSubmitting(true);
    try {
      await api.post(`/admin/approve/${discussion._id}`, { answerId: selectedAnswer._id });
      toast({ type: "success", message: "FAQ approved and added to the knowledge base!" });
      onRefresh();
      onClose();
    } catch (err) {
      toast({ type: "error", message: err.response?.data?.message || "Failed to approve FAQ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/discussions/${discussion._id}`);
      toast({ type: "info", message: "Discussion rejected and removed" });
      onRefresh();
      onClose();
    } catch {
      toast({ type: "error", message: "Failed to reject discussion" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgb(var(--border-default))] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-[rgb(var(--text-primary))]">Verify &amp; Approve FAQ</h2>
            <p className="text-xs text-[rgb(var(--text-tertiary))] mt-0.5">Select the best answer to create an approved FAQ</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[rgb(var(--bg-hover))] flex items-center justify-center text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors">
            ✕
          </button>
        </div>

        {/* Discussion question */}
        <div className="px-6 py-4 border-b border-[rgb(var(--border-default))] bg-[rgb(var(--bg-base))] shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
              {discussion.category}
            </span>
          </div>
          <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{discussion.question}</p>
          {discussion.description && (
            <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">{discussion.description}</p>
          )}
        </div>

        {/* Answers */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <p className="text-xs font-semibold text-[rgb(var(--text-tertiary))] uppercase tracking-wider mb-2">
            Community Answers — {sortedAnswers.length} total (sorted by upvotes)
          </p>
          {sortedAnswers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[rgb(var(--text-tertiary))]">No answers yet. Be the first to answer!</p>
            </div>
          )}
          {sortedAnswers.map((ans, i) => (
            <div
              key={ans._id}
              onClick={() => setSelectedAnswer(ans)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAnswer?._id === ans._id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-[rgb(var(--border-default))] bg-[rgb(var(--bg-base))] hover:border-indigo-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {selectedAnswer?._id === ans._id && (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold mt-0.5">
                    ✓
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={ans.author?.username || "U"} size="sm" />
                    <span className="text-xs font-semibold text-[rgb(var(--text-primary))]">
                      {ans.author?.username || "Anonymous"}
                    </span>
                    <span className="text-[10px] text-[rgb(var(--text-tertiary))]">
                      ▲ {ans.upvotes || 0} upvotes
                    </span>
                    {i === 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Top answer
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed whitespace-pre-wrap">
                    {ans.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[rgb(var(--border-default))] flex items-center gap-3 shrink-0 bg-[rgb(var(--bg-surface))]">
          <button
            onClick={handleReject}
            disabled={submitting}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting || !selectedAnswer}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>Processing...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Approve as FAQ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main AdminPage ──────────────────────────────────────────── */
export default function AdminPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("moderation");
  const [discussions, setDiscussions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState(null); // for verify modal

  // FAQ create form
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: CATEGORIES[0] });
  const [faqSubmitting, setFaqSubmitting] = useState(false);

  // Announcement form
  const [annForm, setAnnForm] = useState({ title: "", content: "", priority: "normal" });
  const [annSubmitting, setAnnSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") navigate("/");
  }, [currentUser, navigate]);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get("/discussions").catch(() => ({ data: [] })),
      api.get("/faqs").catch(() => ({ data: [] })),
      api.get("/announcements").catch(() => ({ data: [] })),
    ]).then(([dRes, fRes, aRes]) => {
      setDiscussions(dRes.data || []);
      setFaqs(fRes.data || []);
      setAnnouncements(aRes.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const pending = discussions.filter((d) => d.status === "open" || !d.status);
  const filtered = discussions.filter((d) => {
    if (filterCat !== "All" && d.category !== filterCat) return false;
    if (filterStatus !== "All" && d.status !== filterStatus) return false;
    return true;
  });

  // FAQ create
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast({ type: "warning", message: "Question and answer are required" }); return;
    }
    setFaqSubmitting(true);
    try {
      await api.post("/admin/faqs", faqForm);
      toast({ type: "success", message: "FAQ created successfully!" });
      setFaqForm({ question: "", answer: "", category: CATEGORIES[0] });
      fetchAll();
    } catch {
      toast({ type: "error", message: "Failed to create FAQ" });
    } finally {
      setFaqSubmitting(false);
    }
  };

  // Announcement submit
  const handleAnnSubmit = async (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) {
      toast({ type: "warning", message: "Title and content are required" }); return;
    }
    setAnnSubmitting(true);
    try {
      await api.post("/announcements", annForm);
      toast({ type: "success", message: "Announcement posted!" });
      setAnnForm({ title: "", content: "", priority: "normal" });
      fetchAll();
    } catch {
      toast({ type: "error", message: "Failed to post announcement" });
    } finally {
      setAnnSubmitting(false);
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (id) => {
    if (!confirm("Delete this FAQ? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      toast({ type: "info", message: "FAQ deleted" });
      fetchAll();
    } catch {
      toast({ type: "error", message: "Failed to delete FAQ" });
    }
  };

  const TABS = [
    { key: "moderation", label: "Moderation", badge: pending.length, color: "text-amber-500" },
    { key: "faq-mgmt", label: "FAQ Management", badge: faqs.length, color: "text-indigo-500" },
    { key: "announcements", label: "Announcements", badge: announcements.length, color: "text-emerald-500" },
    { key: "create", label: "Create FAQ", color: "text-purple-500" },
  ];

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-black text-[rgb(var(--text-primary))]">Admin Panel</h1>
        <p className="text-sm text-[rgb(var(--text-tertiary))] mt-0.5">
          Welcome back, {currentUser?.username} · Manage content, moderation, and FAQs
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <MetricCard icon="💬" label="Pending Discussions" value={pending.length} sub="Awaiting moderation" color="amber" />
        <MetricCard icon="📖" label="Approved FAQs" value={faqs.length} sub="In knowledge base" color="indigo" />
        <MetricCard icon="📌" label="Announcements" value={announcements.length} sub="Active" color="emerald" />
        <MetricCard icon="💬" label="Total Discussions" value={discussions.length} sub="All time" color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-primary))] shadow-sm"
                : "text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]"
            }`}
          >
            <span className={activeTab === tab.key ? tab.color : ""}>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-secondary))]"
                  : "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-tertiary))]"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Moderation ─────────────────────────────────────────── */}
      {activeTab === "moderation" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="input-base w-auto text-xs py-1.5">
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="input-base w-auto text-xs py-1.5">
              <option value="All">All Status</option>
              <option value="open">Open</option>
              <option value="answered">Answered</option>
              <option value="closed">Closed</option>
            </select>
            <span className="text-xs text-[rgb(var(--text-tertiary))]">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Answers</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-sm text-[rgb(var(--text-tertiary))]">No discussions found</td></tr>
                  ) : filtered.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-1 max-w-xs">{d.question}</p>
                      </td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-secondary))]">
                          {d.category}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Avatar name={d.author?.username || "U"} size="sm" />
                          <span className="text-xs text-[rgb(var(--text-secondary))]">{d.author?.username || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-[rgb(var(--text-secondary))]">{d.answers?.length || 0}</span>
                      </td>
                      <td>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          d.status === "open" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          d.status === "answered" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {d.status || "open"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {(d.answers?.length || 0) > 0 && (
                            <button
                              onClick={() => setSelected(d)}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 transition-colors"
                            >
                              Verify &amp; Approve
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this discussion?")) return;
                              try {
                                await api.delete(`/admin/discussions/${d._id}`);
                                toast({ type: "info", message: "Discussion deleted" });
                                fetchAll();
                              } catch {
                                toast({ type: "error", message: "Failed to delete" });
                              }
                            }}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ Management ──────────────────────────────────────── */}
      {activeTab === "faq-mgmt" && (
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Upvotes</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-sm text-[rgb(var(--text-tertiary))]">No FAQs yet</td></tr>
                ) : faqs.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <p className="text-sm font-medium text-[rgb(var(--text-primary))] line-clamp-2 max-w-sm">{f.question}</p>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-secondary))]">
                        {f.category}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-[rgb(var(--text-secondary))]">▲ {f.upvotes || 0}</span>
                    </td>
                    <td>
                      <span className="text-xs text-[rgb(var(--text-tertiary))]">
                        {new Date(f.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteFaq(f._id)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Announcements ───────────────────────────────────────── */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          {/* Post new */}
          <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-5">
            <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-4">Post new announcement</h3>
            <form onSubmit={handleAnnSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  value={annForm.title}
                  onChange={(e) => setAnnForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title"
                  className="input-base"
                />
                <select
                  value={annForm.priority}
                  onChange={(e) => setAnnForm((f) => ({ ...f, priority: e.target.value }))}
                  className="input-base"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                </select>
                <button type="submit" disabled={annSubmitting}
                  className="py-2 px-4 rounded-xl bg-[rgb(var(--color-primary))] text-white text-sm font-semibold hover:bg-[rgb(var(--color-primary-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {annSubmitting ? "Posting..." : "📌 Post announcement"}
                </button>
              </div>
              <textarea
                value={annForm.content}
                onChange={(e) => setAnnForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Announcement content..."
                className="input-base resize-none h-20"
              />
            </form>
          </div>

          {/* List */}
          <div className="space-y-2">
            {announcements.length === 0 && (
              <p className="text-center py-10 text-sm text-[rgb(var(--text-tertiary))]">No announcements yet</p>
            )}
            {announcements.map((a) => (
              <div key={a._id}
                className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm shrink-0">
                  📌
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-[rgb(var(--text-primary))]">{a.title}</p>
                    {a.priority === "high" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">HIGH</span>
                    )}
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">{a.content}</p>
                  <p className="text-[10px] text-[rgb(var(--text-tertiary))] mt-1">
                    {new Date(a.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create FAQ ──────────────────────────────────────────── */}
      {activeTab === "create" && (
        <div className="max-w-2xl">
          <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-6">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-5" />
            <h3 className="text-base font-bold text-[rgb(var(--text-primary))] mb-1">Create FAQ manually</h3>
            <p className="text-xs text-[rgb(var(--text-tertiary))] mb-5">Add a new verified FAQ directly to the knowledge base</p>
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[rgb(var(--text-secondary))] mb-1.5">Question *</label>
                <input
                  value={faqForm.question}
                  onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="Enter the frequently asked question..."
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[rgb(var(--text-secondary))] mb-1.5">Answer *</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
                  placeholder="Write a clear, concise answer..."
                  className="input-base resize-none h-32"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[rgb(var(--text-secondary))] mb-1.5">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm((f) => ({ ...f, category: e.target.value }))}
                  className="input-base"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" disabled={faqSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {faqSubmitting ? "Creating FAQ..." : "➕ Create FAQ"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Approve Modal */}
      {selected && (
        <VerifyApproveModal
          discussion={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchAll}
        />
      )}
    </div>
  );
}