import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "All", "Academics", "Hostel", "Finance", "Library", "Sports",
  "Clubs", "Events", "Health", "Transport", "Admin", "IT Support", "Career", "Other",
];

const CATEGORY_COLORS = {
  Academics: "bg-blue-100 text-blue-800",
  Hostel: "bg-green-100 text-green-800",
  Finance: "bg-yellow-100 text-yellow-800",
  Library: "bg-purple-100 text-purple-800",
  Sports: "bg-red-100 text-red-800",
  Clubs: "bg-pink-100 text-pink-800",
  Events: "bg-indigo-100 text-indigo-800",
  Health: "bg-teal-100 text-teal-800",
  Transport: "bg-orange-100 text-orange-800",
  Admin: "bg-gray-100 text-gray-800",
  "IT Support": "bg-cyan-100 text-cyan-800",
  Career: "bg-lime-100 text-lime-800",
  Other: "bg-slate-100 text-slate-800",
};

const STATUS_COLORS = {
  unanswered: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  answered: "bg-green-100 text-green-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-gray-100 text-gray-600",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", description: "", category: "Academics" });
  const [formErrors, setFormErrors] = useState({ title: "", description: "" });
  const [expandedId, setExpandedId] = useState(null);
  const [answerInputs, setAnswerInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [voteErrors, setVoteErrors] = useState({});
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Use refs to avoid stale closures
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
      .then((res) => {
        setDiscussions(res.data);
      })
      .catch((err) => {
        console.error("Fetch discussions error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle ?category= URL param on mount
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
      categoryRef.current = cat;
      setSearchQuery("");
      searchRef.current = "";
      setSortBy("recent");
      sortRef.current = "recent";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    categoryRef.current = cat;
    setSearchQuery("");
    searchRef.current = "";
    setSortBy("recent");
    sortRef.current = "recent";
  };

  const handleSearch = () => {
    fetchDiscussions();
  };

  const handleUpvote = (id) => {
    if (!currentUser) return;
    api.patch(`/discussions/${id}/upvote`).then((res) => {
      setDiscussions((prev) =>
        prev.map((d) => d._id === id ? { ...d, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : d)
      );
      setVoteErrors((prev) => ({ ...prev, [id]: "" }));
    }).catch((err) => {
      if (err.response?.status === 400) setVoteErrors((prev) => ({ ...prev, [id]: "Already voted" }));
    });
  };

  const handleDownvote = (id) => {
    if (!currentUser) return;
    api.patch(`/discussions/${id}/downvote`).then((res) => {
      setDiscussions((prev) =>
        prev.map((d) => d._id === id ? { ...d, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : d)
      );
      setVoteErrors((prev) => ({ ...prev, [id]: "" }));
    }).catch((err) => {
      if (err.response?.status === 400) setVoteErrors((prev) => ({ ...prev, [id]: "Already voted" }));
    });
  };

  const handleSubmitAnswer = (discussionId) => {
    const content = answerInputs[discussionId]?.trim();
    if (!content) { alert("Answer cannot be empty"); return; }
    api.post(`/discussions/${discussionId}/answers`, { content }).then(() => {
      setAnswerInputs((prev) => ({ ...prev, [discussionId]: "" }));
      fetchDiscussions();
    });
  };

  const handleSubmitComment = (discussionId) => {
    const content = commentInputs[discussionId]?.trim();
    if (!content) return;
    api.post(`/discussions/${discussionId}/comments`, { content }).then(() => {
      setCommentInputs((prev) => ({ ...prev, [discussionId]: "" }));
      fetchDiscussions();
    });
  };

  const handleAddQuestion = () => {
    const errors = { title: "", description: "" };
    if (!newQuestion.title.trim()) errors.title = "Title is required";
    if (!newQuestion.description.trim()) errors.description = "Description is required";
    if (errors.title || errors.description) { setFormErrors(errors); return; }
    api.post("/discussions", newQuestion).then(() => {
      setShowAddModal(false);
      setNewQuestion({ title: "", description: "", category: "Academics" });
      setFormErrors({ title: "", description: "" });
      fetchDiscussions();
    }).catch((err) => {
      console.error("Add question error:", err);
      alert("Failed to add question: " + (err.response?.data?.message || err.message));
    });
  };

  const hasVerifiedAnswer = (discussion) => discussion.answers?.some((a) => a.isVerified);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-200 p-4 shrink-0">
        <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Top Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search discussions..."
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Search
            </button>

            <div className="flex gap-1 border border-gray-200 rounded-md overflow-hidden">
              {[
                { label: "Recent", value: "recent" },
                { label: "Most Upvoted", value: "upvotes" },
                { label: "Unanswered", value: "unanswered" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`px-3 py-2 text-sm ${
                    sortBy === value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {currentUser && (
              <button
                onClick={() => setShowAddModal(true)}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                + Ask Question
              </button>
            )}
          </div>
        </div>

        {/* Discussion Cards */}
        {loading ? (
          <p className="text-gray-500 text-center py-10">Loading...</p>
        ) : discussions.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No discussions found.</p>
        ) : (
          <div className="space-y-4">
            {discussions.map((d) => (
              <div key={d._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{d.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {d.description.length > 120 ? d.description.slice(0, 120) + "..." : d.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[d.category] || "bg-gray-100 text-gray-700"}`}>
                        {d.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[d.status] || "bg-gray-100 text-gray-600"}`}>
                        {d.status}
                      </span>
                      {hasVerifiedAnswer(d) && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                          ✓ Admin Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <button
                        onClick={() => handleUpvote(d._id)}
                        disabled={!currentUser}
                        className={`px-2 py-1 rounded hover:bg-gray-100 ${currentUser ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                      >
                        👍 {d.upvotes}
                      </button>
                      <button
                        onClick={() => handleDownvote(d._id)}
                        disabled={!currentUser}
                        className={`px-2 py-1 rounded hover:bg-gray-100 ${currentUser ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
                      >
                        👎 {d.downvotes}
                      </button>
                    </div>
                    {voteErrors[d._id] && (
                      <p className="text-xs text-red-500 mt-1">{voteErrors[d._id]}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(d.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === d._id ? null : d._id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {expandedId === d._id ? "Hide Discussion" : "View Discussion"}
                  </button>
                </div>

                {/* Expanded Section */}
                {expandedId === d._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                      <p className="text-gray-700 text-sm">{d.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Answers {d.answers?.length > 0 && `(${d.answers.length})`}
                      </h4>
                      {d.answers?.length > 0 ? (
                        <div className="space-y-3">
                          {d.answers.map((ans) => (
                            <div key={ans._id} className={`p-3 rounded-md border ${ans.isVerified ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-800">{ans.author?.username || "Unknown"}</span>
                                {ans.isVerified && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800">✓ Verified</span>
                                )}
                                <span className="text-xs text-gray-400">{formatDate(ans.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{ans.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No answers yet.</p>
                      )}

                      {currentUser && (
                        <div className="mt-3 flex gap-2">
                          <textarea
                            value={answerInputs[d._id] || ""}
                            onChange={(e) => setAnswerInputs((prev) => ({ ...prev, [d._id]: e.target.value }))}
                            placeholder="Write your answer..."
                            rows={2}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <button
                            onClick={() => handleSubmitAnswer(d._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 self-start"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Comments {d.comments?.length > 0 && `(${d.comments.length})`}
                      </h4>
                      {d.comments?.length > 0 ? (
                        <div className="space-y-2">
                          {d.comments.map((cmt) => (
                            <div key={cmt._id} className="p-2 bg-gray-50 rounded border border-gray-100">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-700">{cmt.author?.username || "Unknown"}</span>
                                <span className="text-xs text-gray-400">{formatDate(cmt.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-600">{cmt.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No comments yet.</p>
                      )}

                      {currentUser && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[d._id] || ""}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [d._id]: e.target.value }))}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleSubmitComment(d._id)}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                          >
                            Comment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ask a Question</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Summarize your question"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your question in detail"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setFormErrors({ title: "", description: "" }); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}