import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + color + " flex items-center justify-center text-lg shadow-sm"}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
          <p className="text-xs text-slate-400 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg shadow-sm">{icon}</div>
      <div>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

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
    setTimeout(() => setToast(null), 3000);
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
    if (!window.confirm("Approve this answer as an FAQ? The discussion will be deleted.")) return;
    api.patch("/admin/discussions/" + modalDiscussionId + "/approve", { answerId })
      .then(() => { closeModal(); fetchDiscussions(); fetchFaqs(); fetchAnalytics(); showToast("Answer approved as FAQ!"); })
      .catch((err) => showToast(err.response?.data?.message || "Failed to approve", "error"));
  };

  const handlePostAnnouncement = () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    setAnnLoading(true);
    api.post("/announcements", announcementForm)
      .then(() => { setAnnouncementForm({ title: "", content: "" }); fetchAnnouncements(); showToast("Announcement posted!"); })
      .catch(() => showToast("Failed to post announcement", "error"))
      .finally(() => setAnnLoading(false));
  };

  const handleReject = (id) => {
    if (!window.confirm("Reject this discussion?")) return;
    api.patch("/admin/discussions/" + id + "/reject")
      .then(() => { fetchDiscussions(); fetchAnalytics(); showToast("Discussion rejected"); })
      .catch(() => showToast("Failed to reject", "error"));
  };

  const handleDeleteDiscussion = (id) => {
    if (!window.confirm("Delete this discussion permanently?")) return;
    api.delete("/admin/discussions/" + id)
      .then(() => { fetchDiscussions(); fetchAnalytics(); showToast("Discussion deleted"); })
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
      .then(() => { setFaqForm({ question: "", answer: "", category: "About the Internship" }); fetchFaqs(); fetchAnalytics(); showToast("FAQ created successfully!"); })
      .catch(() => showToast("Failed to create FAQ", "error"))
      .finally(() => setFaqCreateLoading(false));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const getCatMeta = (name) => CATEGORIES.find((c) => c.name === name);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={"fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl flex items-center gap-2 " + (
          toast.type === "error" ? "bg-red-500 text-white" : "bg-slate-800 text-white")}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>{toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">⚙️</div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
              <p className="text-xs text-slate-400 mt-0.5">FAQ Management System — Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all">
              🏠 <span className="hidden sm:inline">Home</span>
            </button>
            <button onClick={() => navigate("/discussions")} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium transition-all">
              💬 <span className="hidden sm:inline">Discussions</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Analytics */}
        <section>
          <SectionHeader icon="📊" title="Dashboard Overview" subtitle="System statistics at a glance" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="📚" label="Total FAQs" value={analytics.totalFaqs} color="from-indigo-500 to-blue-500" />
            <StatCard icon="👥" label="Total Users" value={analytics.totalUsers} color="from-teal-500 to-green-500" />
            <StatCard icon="🏷️" label="Most Active Category" value={analytics.mostActiveCategory || "—"} color="from-orange-500 to-amber-500" />
            <StatCard icon="🔥" label="Top Question" value={analytics.mostUpvotedQuestion ? analytics.mostUpvotedQuestion.upvotes + " 👍" : "—"} color="from-red-500 to-pink-500" />
          </div>
        </section>

        {/* Announcements */}
        <section>
          <SectionHeader icon="📢" title="Announcements" subtitle="Broadcast messages shown on the home page" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Post New Announcement</h3>
              <div className="space-y-3">
                <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all" />
                <textarea value={announcementForm.content} onChange={(e) => setAnnouncementForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="What do you want to announce?" rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all resize-none" />
                <button onClick={handlePostAnnouncement} disabled={annLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-60">
                  {annLoading ? "Posting..." : "📢 Post Announcement"}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Recent Announcements</h3>
              {announcements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-slate-400 text-sm">No announcements yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {announcements.map((a) => (
                    <div key={a._id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                          <p className="text-slate-600 text-xs mt-1 leading-relaxed">{a.content}</p>
                          <p className="text-xs text-amber-500 mt-2 font-medium">📅 {formatDate(a.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Discussion Moderation */}
        <section>
          <SectionHeader icon="🛡️" title="Discussion Moderation" subtitle="Review, verify, approve, or reject community discussions" />
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Statuses</option>
                <option value="unanswered">Unanswered</option>
                <option value="pending">Pending</option>
                <option value="answered">Answered</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="ml-auto text-xs text-slate-400 flex items-center">
                <span>{discussions.length} thread{discussions.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Table */}
            {discussions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">🛡️</div>
                <p className="text-slate-400 font-medium">No discussions to moderate</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Question</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Votes</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Answers</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discussions.map((d) => {
                      const catMeta = getCatMeta(d.category);
                      return (
                        <tr key={d._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800 line-clamp-1 max-w-xs">{d.title}</p>
                          </td>
                          <td className="px-5 py-4">
                            {catMeta && <span className={"text-xs font-medium px-2.5 py-1 rounded-lg " + catMeta.bg + " " + catMeta.text}>{catMeta.icon} {d.category}</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={"text-xs font-medium px-2.5 py-1 rounded-lg " + (STATUS_COLORS[d.status] || STATUS_COLORS.pending)}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <span>👍</span><span>{d.upvotes}</span>
                              <span className="mx-1">·</span>
                              <span>👎</span><span>{d.downvotes}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold text-indigo-600">{d.answers?.length || 0} answer{d.answers?.length !== 1 ? "s" : ""}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-slate-400">{formatDate(d.createdAt)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {d.answers?.length > 0 && d.status !== "approved" && d.status !== "rejected" && (
                                <button onClick={() => openVerifyModal(d)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95">
                                  ✓ Verify & Approve
                                </button>
                              )}
                              {d.status !== "rejected" && (
                                <button onClick={() => handleReject(d._id)}
                                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition-all active:scale-95">
                                  Reject
                                </button>
                              )}
                              <button onClick={() => handleDeleteDiscussion(d._id)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-all active:scale-95">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Management */}
        <section>
          <SectionHeader icon="📚" title="FAQ Management" subtitle="View and manage all approved and pending FAQs" />
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {faqs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-slate-400 font-medium">No FAQs yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Question</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Votes</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((f) => {
                      const catMeta = getCatMeta(f.category);
                      return (
                        <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-800 line-clamp-2 max-w-md">{f.question}</p>
                          </td>
                          <td className="px-5 py-4">
                            {catMeta && <span className={"text-xs font-medium px-2.5 py-1 rounded-lg " + catMeta.bg + " " + catMeta.text}>{catMeta.icon} {f.category}</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={"text-xs font-medium px-2.5 py-1 rounded-lg " + (f.status === "approved" ? "bg-green-50 text-green-600 border border-green-200" : "bg-amber-50 text-amber-600 border border-amber-200")}>
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
                            <div className="flex items-center gap-2">
                              {f.status !== "approved" && (
                                <button onClick={() => handleApproveFaq(f._id)}
                                  className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-all active:scale-95">
                                  ✓ Approve
                                </button>
                              )}
                              <button onClick={() => handleDeleteFaq(f._id)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-all active:scale-95">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Create FAQ Manually */}
        <section>
          <SectionHeader icon="✏️" title="Create FAQ Manually" subtitle="Add a new FAQ directly without going through discussions" />
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Question</label>
                <input type="text" value={faqForm.question} onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
                  placeholder="What question are you answering?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select value={faqForm.category} onChange={(e) => setFaqForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              <label className="text-sm font-semibold text-slate-700">Answer</label>
              <textarea value={faqForm.answer} onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Write the full answer here..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all resize-none" />
            </div>
            <button onClick={handleCreateFaq} disabled={faqCreateLoading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-60 active:scale-95">
              {faqCreateLoading ? "Creating..." : "✏️ Create FAQ"}
            </button>
          </div>
        </section>
      </main>

      {/* Verify & Approve Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-base shadow-sm">✓</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Verify & Approve Answer</h2>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{modalTitle}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl transition-colors">✕</button>
              </div>

              <div className="mt-5 mb-6">
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 mb-4">
                  <span className="text-indigo-500 text-sm">ℹ️</span>
                  <p className="text-xs text-indigo-700 font-medium">Answers are sorted by upvotes. Click "Approve as FAQ" to promote an answer.</p>
                </div>

                {modalAnswers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p className="text-slate-400 text-sm">No answers to review</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {modalAnswers.map((ans, idx) => (
                      <div key={ans._id} className={"p-4 rounded-xl border transition-all " + (ans.isVerified ? "border-green-300 bg-green-50" : "border-slate-200 bg-slate-50")}>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-600">#{idx + 1}</span>
                          <span className="text-xs text-amber-600 font-semibold">🔥 {ans.upvotes || 0} upvotes</span>
                          {ans.isVerified && <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800 font-semibold">✓ Verified</span>}
                          <span className="text-xs text-slate-400 ml-auto">👤 {ans.author?.username || "Unknown"}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{ans.content}</p>
                        <button
                          onClick={() => handleApproveFromModal(ans._id)}
                          className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all active:scale-98">
                          ✓ Approve as FAQ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={closeModal}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-sm transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}