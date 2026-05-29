import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

const AVATAR_COLORS = [
  "from-violet-500 to-purple-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

function Avatar({ username, index }) {
  const c = AVATAR_COLORS[(index || 0) % AVATAR_COLORS.length];
  return (
    <div className={"w-8 h-8 rounded-xl bg-gradient-to-br " + c + " flex items-center justify-center text-white text-xs font-extrabold shadow-sm shrink-0"}>
      {(username || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-extrabold text-slate-900">{value ?? "—"}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={"w-11 h-11 rounded-2xl bg-gradient-to-br " + color + " flex items-center justify-center text-xl shadow-sm"}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, count }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{icon}</span>
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        {count !== undefined && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{count}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discussions");
  const [analytics, setAnalytics] = useState({ totalFaqs: 0, totalUsers: 0, mostActiveCategory: "", mostUpvotedQuestion: null });
  const [discussions, setDiscussions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "About the Internship" });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDiscussionId, setModalDiscussionId] = useState(null);
  const [modalAnswers, setModalAnswers] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [toast, setToast] = useState(null);
  const [annLoading, setAnnLoading] = useState(false);
  const [faqCreateLoading, setFaqCreateLoading] = useState(false);

  const categoryFilterRef = useRef(categoryFilter);
  const statusFilterRef = useRef(statusFilter);
  useEffect(() => { categoryFilterRef.current = categoryFilter; }, [categoryFilter]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDiscussions = useRef(() => {
    const params = {};
    if (categoryFilterRef.current) params.category = categoryFilterRef.current;
    if (statusFilterRef.current) params.status = statusFilterRef.current;
    api.get("/admin/discussions", { params })
      .then((res) => setDiscussions(res.data))
      .catch((err) => console.error(err));
  }).current;

  const fetchAnalytics = useRef(() => {
    api.get("/admin/analytics")
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error(err));
  }).current;

  const fetchFaqs = useRef(() => {
    api.get("/faqs")
      .then((res) => setFaqs(res.data))
      .catch((err) => console.error(err));
  }).current;

  const fetchAnnouncements = useRef(() => {
    api.get("/announcements")
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error(err));
  }).current;

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchAnalytics();
    fetchDiscussions();
    fetchFaqs();
    fetchAnnouncements();
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    fetchDiscussions();
  }, [categoryFilter, statusFilter]);

  const openVerifyModal = (discussion) => {
    const sortedAnswers = [...(discussion.answers || [])].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    setModalDiscussionId(discussion._id);
    setModalAnswers(sortedAnswers);
    setModalTitle(discussion.title);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setModalDiscussionId(null); setModalAnswers([]); setModalTitle(""); };

  const handleApproveFromModal = (answerId) => {
    if (!window.confirm("Approve this answer as FAQ?")) return;
    api.patch("/admin/discussions/" + modalDiscussionId + "/approve", { answerId })
      .then(() => { closeModal(); fetchDiscussions(); fetchFaqs(); fetchAnalytics(); showToast("Answer approved as FAQ!"); })
      .catch((err) => showToast(err.response?.data?.message || "Failed to approve", "error"));
  };

  const handlePostAnnouncement = () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    setAnnLoading(true);
    api.post("/announcements", announcementForm)
      .then(() => { setAnnouncementForm({ title: "", content: "" }); fetchAnnouncements(); showToast("Announcement posted!"); })
      .catch(() => showToast("Failed to post", "error"))
      .finally(() => setAnnLoading(false));
  };

  const handleReject = (id) => {
    if (!window.confirm("Reject this discussion?")) return;
    api.patch("/admin/discussions/" + id + "/reject")
      .then(() => { fetchDiscussions(); fetchAnalytics(); showToast("Discussion rejected"); })
      .catch(() => showToast("Failed to reject", "error"));
  };

  const handleDeleteDiscussion = (id) => {
    if (!window.confirm("Delete this permanently?")) return;
    api.delete("/admin/discussions/" + id)
      .then(() => { fetchDiscussions(); fetchAnalytics(); showToast("Deleted"); })
      .catch(() => showToast("Failed to delete", "error"));
  };

  const handleDeleteFaq = (id) => {
    if (!window.confirm("Delete this FAQ permanently?")) return;
    api.delete("/faqs/" + id)
      .then(() => { fetchFaqs(); fetchAnalytics(); showToast("FAQ deleted"); })
      .catch(() => showToast("Failed to delete FAQ", "error"));
  };

  const handleApproveFaq = (id) => {
    if (!window.confirm("Approve this FAQ?")) return;
    api.patch("/faqs/" + id + "/approve")
      .then(() => { fetchFaqs(); fetchAnalytics(); showToast("FAQ approved"); })
      .catch(() => showToast("Failed to approve", "error"));
  };

  const handleCreateFaq = () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    setFaqCreateLoading(true);
    api.post("/faqs", faqForm)
      .then(() => { setFaqForm({ question: "", answer: "", category: "About the Internship" }); fetchFaqs(); fetchAnalytics(); showToast("FAQ created!"); })
      .catch(() => showToast("Failed to create", "error"))
      .finally(() => setFaqCreateLoading(false));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const TABS = [
    { id: "discussions", icon: "💬", label: "Moderation" },
    { id: "faqs", icon: "📚", label: "FAQ Management" },
    { id: "announcements", icon: "📢", label: "Announcements" },
    { id: "create", icon: "✏️", label: "Create FAQ" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={"fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl flex items-center gap-2 animate-popIn " + (
          toast.type === "error" ? "bg-red-500 text-white" : "bg-slate-900 text-white")}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>{toast.msg}
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-sm">⚙️</div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-400">FAQ Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/")} className="btn-ghost px-3 py-2 text-sm text-slate-600 rounded-xl">🏠 Home</button>
              <button onClick={() => navigate("/discussions")} className="btn-ghost px-3 py-2 text-sm text-slate-600 rounded-xl">💬 Discussions</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon="📚" label="Total FAQs" value={analytics.totalFaqs} color="from-indigo-500 to-blue-500" />
          <MetricCard icon="👥" label="Posts / Threads" value={analytics.totalUsers} sub="Community discussions" color="from-teal-500 to-emerald-500" />
          <MetricCard icon="🏷️" label="Top Category" value={analytics.mostActiveCategory?.split(" ")[0] || "—"} sub={analytics.mostActiveCategory || ""} color="from-orange-500 to-amber-500" />
          <MetricCard icon="🔥" label="Top Question" value={analytics.mostUpvotedQuestion ? analytics.mostUpvotedQuestion.upvotes + " 👍" : "—"} sub={analytics.mostUpvotedQuestion?.question?.slice(0, 30) || ""} color="from-red-500 to-pink-500" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 overflow-x-auto">
          {TABS.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={"flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap " + (
                activeTab === id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              )}>
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Discussion Moderation ── */}
        {activeTab === "discussions" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Filters */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="answered">Answered</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="unanswered">Unanswered</option>
              </select>
              <span className="ml-auto text-xs font-semibold text-slate-400">{discussions.length} thread{discussions.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Table */}
            {discussions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-2">🛡️</div>
                <p className="text-slate-400 font-semibold">All clear — no discussions to moderate</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Question</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Votes</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Replies</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discussions.map((d, idx) => (
                      <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <Avatar username={d.author?.username} index={idx} />
                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{d.title}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-slate-500">{d.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={"text-xs font-bold em-2 px-2.5 py-1 rounded-xl border " + (
                            d.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            d.status === "rejected" ? "bg-slate-100 text-slate-500 border-slate-200" :
                            d.status === "answered" ? "bg-blue-50 text-blue-600 border-blue-200" :
                            d.status === "unanswered" ? "bg-red-50 text-red-500 border-red-200" :
                            "bg-amber-50 text-amber-600 border-amber-200"
                          )}>{d.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500">👍 {(d.upvotes || 0) + (d.downvotes || 0)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-indigo-600">{d.answers?.length || 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-400">{formatDate(d.createdAt)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {d.answers?.length > 0 && d.status !== "approved" && d.status !== "rejected" && (
                              <button onClick={() => openVerifyModal(d)}
                                className="px-3 py-1.5 btn-primary text-xs rounded-xl">
                                ✓ Verify & Approve
                              </button>
                            )}
                            {d.status !== "rejected" && (
                              <button onClick={() => handleReject(d._id)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-all">
                                Reject
                              </button>
                            )}
                            <button onClick={() => handleDeleteDiscussion(d._id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FAQ Management ── */}
        {activeTab === "faqs" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {faqs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-2">📚</div>
                <p className="text-slate-400 font-semibold">No FAQs yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Votes</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((f) => (
                      <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 max-w-sm">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2">{f.question}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-semibold text-slate-500">{f.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={"text-xs font-bold px-2.5 py-1 rounded-xl border " + (f.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200")}>
                            {f.status || "pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500">👍 {f.upvotes || 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-400">{formatDate(f.createdAt)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            {f.status !== "approved" && (
                              <button onClick={() => handleApproveFaq(f._id)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-all">
                                ✓ Approve
                              </button>
                            )}
                            <button onClick={() => handleDeleteFaq(f._id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Announcements ── */}
        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionTitle icon="📢" title="Post Announcement" />
              <div className="space-y-3">
                <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all" />
                <textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="What do you want to announce?"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:border-indigo-400 transition-all" />
                <button onClick={handlePostAnnouncement} disabled={annLoading}
                  className="w-full py-3 btn-primary text-sm">
                  {annLoading ? "Posting..." : "📢 Post Announcement"}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionTitle icon="📋" title="Recent Announcements" count={announcements.length} />
              {announcements.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-slate-400 text-sm">No announcements posted yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {announcements.map((a) => (
                    <div key={a._id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <p className="text-sm font-bold text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.content}</p>
                      <p className="text-xs text-amber-500 mt-2 font-semibold">📅 {formatDate(a.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Create FAQ Manually ── */}
        {activeTab === "create" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <SectionTitle icon="✏️" title="Create FAQ Manually" subtitle="Add a new FAQ directly without going through discussions" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Question</label>
                <input type="text" value={faqForm.question} onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="What question are you answering?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Category</label>
                <select value={faqForm.category} onChange={(e) => setFaqForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Answer</label>
              <textarea value={faqForm.answer} onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Write the full answer here..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white focus:border-indigo-400 transition-all" />
            </div>
            <button onClick={handleCreateFaq} disabled={faqCreateLoading}
              className="px-6 py-3 btn-primary text-sm">
              {faqCreateLoading ? "Creating..." : "✏️ Create FAQ"}
            </button>
          </div>
        )}
      </main>

      {/* Verify & Approve Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-popIn" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />
            <div className="p-7">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg shadow-sm">✓</div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Verify & Approve</h2>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{modalTitle}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">✕</button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <span className="text-indigo-500 text-sm mt-0.5">ℹ️</span>
                <p className="text-xs text-indigo-700 font-medium leading-relaxed">Answers are sorted by upvotes. Click <strong>"Approve as FAQ"</strong> to promote an answer and remove the discussion thread.</p>
              </div>

              {modalAnswers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-slate-400 text-sm">No answers to review</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {modalAnswers.map((ans, idx) => (
                    <div key={ans._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-600">#{idx + 1}</span>
                        <span className="text-xs font-bold text-amber-600">🔥 {ans.upvotes || 0} upvotes</span>
                        <span className="text-xs text-slate-400 ml-auto">👤 {ans.author?.username || "Unknown"}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{ans.content}</p>
                      <button onClick={() => handleApproveFromModal(ans._id)}
                        className="w-full py-2.5 btn-primary text-xs rounded-xl">
                        ✓ Approve as FAQ
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={closeModal} className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}