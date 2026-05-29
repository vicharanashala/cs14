import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({
    totalFaqs: 0,
    totalUsers: 0,
    mostActiveCategory: "",
    mostUpvotedQuestion: null,
  });
  const [discussions, setDiscussions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "Academics" });

  // Modal is completely independent state — plain useState, nothing fancy
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDiscussionId, setModalDiscussionId] = useState(null);
  const [modalAnswers, setModalAnswers] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const categoryFilterRef = useRef(categoryFilter);
  const statusFilterRef = useRef(statusFilter);
  useEffect(() => { categoryFilterRef.current = categoryFilter; }, [categoryFilter]);
  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    fetchDiscussions();
  }, [categoryFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function openVerifyModal(discussion) {
    const sortedAnswers = [...(discussion.answers || [])].sort(
      (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
    );
    // Set each piece of modal state separately to avoid any object reference issues
    setModalDiscussionId(discussion._id);
    setModalAnswers(sortedAnswers);
    setModalTitle(discussion.title);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalDiscussionId(null);
    setModalAnswers([]);
    setModalTitle("");
  }

  function handleApproveFromModal(answerId) {
    if (!window.confirm("Are you sure you want to approve this answer and move it to FAQs?")) return;
    api.patch(`/admin/discussions/${modalDiscussionId}/approve`, { answerId })
      .then(() => {
        closeModal();
        fetchDiscussions();
        fetchFaqs();
        fetchAnalytics();
      })
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.message || "Failed to approve as FAQ. Check the console.");
      });
  }

  function handlePostAnnouncement() {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    api.post("/announcements", announcementForm)
      .then(() => {
        setAnnouncementForm({ title: "", content: "" });
        fetchAnnouncements();
      })
      .catch((err) => console.error(err));
  }

  function handleReject(id) {
    if (!window.confirm("Reject this discussion?")) return;
    api.patch(`/admin/discussions/${id}/reject`)
      .then(() => { fetchDiscussions(); fetchAnalytics(); })
      .catch((err) => console.error(err));
  }

  function handleDeleteDiscussion(id) {
    if (!window.confirm("Delete this discussion?")) return;
    api.delete(`/admin/discussions/${id}`)
      .then(() => { fetchDiscussions(); fetchAnalytics(); })
      .catch((err) => console.error(err));
  }

  function handleDeleteFaq(id) {
    if (!window.confirm("Delete this FAQ?")) return;
    api.delete(`/faqs/${id}`)
      .then(() => { fetchFaqs(); fetchAnalytics(); })
      .catch((err) => console.error(err));
  }

  function handleApproveFaq(id) {
    if (!window.confirm("Approve this FAQ?")) return;
    api.patch(`/faqs/${id}/approve`)
      .then(() => { fetchFaqs(); fetchAnalytics(); })
      .catch((err) => console.error(err));
  }

  function handleCreateFaq() {
    if (!faqForm.question.trim() || !faqForm.answer.trim() || !faqForm.category) return;
    api.post("/faqs", faqForm)
      .then(() => {
        setFaqForm({ question: "", answer: "", category: "Academics" });
        fetchFaqs();
        fetchAnalytics();
      })
      .catch((err) => console.error(err));
  }

  const CATEGORIES = [
    "About the Internship",
    "Timing and Dates",
    "NOC",
    "Selection and Offer Letter",
    "Work and Mentorship",
    "Communication Channels",
    "Interviews",
    "Certificate",
    "Rosetta",
    "Phase 1 and Coursework",
    "Yaksha Chat",
    "ViBe Platform",
    "Team Formation",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* SECTION 1 — Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Total FAQs</p>
          <p className="text-2xl font-bold">{analytics.totalFaqs}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Most Active Category</p>
          <p className="text-2xl font-bold">{analytics.mostActiveCategory || "—"}</p>
        </div>
        <div className="bg-white border rounded p-4">
          <p className="text-gray-500 text-sm">Top Question</p>
          <p className="text-lg font-semibold truncate">
            {analytics.mostUpvotedQuestion
              ? `${analytics.mostUpvotedQuestion.title} (${analytics.mostUpvotedQuestion.upvotes} upvotes)`
              : "—"}
          </p>
        </div>
      </div>

      {/* SECTION 2 — Announcements */}
      <div className="bg-white border rounded p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Announcements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <input
              type="text"
              placeholder="Title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border p-2 mb-3 rounded"
            />
            <textarea
              placeholder="Content"
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full border p-2 mb-3 rounded"
              rows="4"
            />
            <button
              onClick={handlePostAnnouncement}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post Announcement
            </button>
          </div>
          <div>
            {announcements.length === 0 ? (
              <p className="text-gray-500">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="border-b py-3">
                  <p className="font-bold">{a.title}</p>
                  <p className="text-gray-600">{a.content}</p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3 — Discussion Moderation */}
      <div className="bg-white border rounded p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Discussion Moderation</h2>
        <div className="flex gap-4 mb-4">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border p-2 rounded">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
            <option value="">All Statuses</option>
            <option value="unanswered">Unanswered</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Upvotes</th>
                <th className="p-2">Answers</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discussions.map((d) => (
                <tr key={d._id} className="border-b">
                  <td className="p-2">{d.title}</td>
                  <td className="p-2">{d.category}</td>
                  <td className="p-2">{d.status}</td>
                  <td className="p-2">{d.upvotes}</td>
                  <td className="p-2">{d.answers?.length || 0}</td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    {d.answers?.length > 0 &&
                      d.status !== "approved" &&
                      d.status !== "rejected" && (
                        <button
                          onClick={() => openVerifyModal(d)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Verify & Approve
                        </button>
                      )}
                    <button
                      onClick={() => handleReject(d._id)}
                      className="bg-orange-500 text-white px-2 py-1 rounded text-sm hover:bg-orange-600"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDeleteDiscussion(d._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
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

      {/* SECTION 4 — FAQ Management */}
      <div className="bg-white border rounded p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">FAQ Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Question</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Upvotes</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f._id} className="border-b">
                  <td className="p-2">{f.question}</td>
                  <td className="p-2">{f.category}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      f.status === "approved" ? "bg-green-100 text-green-700"
                      : f.status === "rejected" ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {f.status || "pending"}
                    </span>
                  </td>
                  <td className="p-2">{f.upvotes}</td>
                  <td className="p-2">{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    {f.status !== "approved" && (
                      <button
                        onClick={() => handleApproveFaq(f._id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFaq(f._id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
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

      {/* SECTION 5 — Create FAQ Manually */}
      <div className="bg-white border rounded p-6">
        <h2 className="text-xl font-bold mb-4">Create FAQ Manually</h2>
        <div className="flex flex-col gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Question"
            value={faqForm.question}
            onChange={(e) => setFaqForm((f) => ({ ...f, question: e.target.value }))}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Answer"
            value={faqForm.answer}
            onChange={(e) => setFaqForm((f) => ({ ...f, answer: e.target.value }))}
            className="border p-2 rounded"
            rows="4"
          />
          <select
            value={faqForm.category}
            onChange={(e) => setFaqForm((f) => ({ ...f, category: e.target.value }))}
            className="border p-2 rounded"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={handleCreateFaq}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create FAQ
          </button>
        </div>
      </div>

      {/* ---- MODAL: rendered at root level, outside all sections ---- */}
      {modalOpen && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{ background: "#fff", borderRadius: 8, padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Review & Approve Answer</h3>
            <p className="text-sm text-gray-600 mb-1">{modalTitle}</p>
            <p className="text-xs text-gray-500 mb-4">
              Answers sorted by upvotes. Click "Approve as FAQ" on the one you want.
            </p>

            {modalAnswers.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4">No answers found.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {modalAnswers.map((a, index) => (
                  <div key={a._id} className="border p-3 rounded">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#{index + 1}</span>
                      <span className="text-xs text-gray-500">👍 {a.upvotes || 0} upvotes</span>
                      {a.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ Verified</span>
                      )}
                      {a.author?.username && (
                        <span className="text-xs text-gray-400">by {a.author.username}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-3">{a.content}</p>
                    <button
                      onClick={() => handleApproveFromModal(a._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 font-medium"
                    >
                      Approve as FAQ
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={closeModal}
              className="bg-gray-400 text-white px-4 py-2 rounded text-sm hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}