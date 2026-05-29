import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

const CATEGORY_COLORS = {
  "About the Internship": "bg-blue-100 text-blue-800",
  "Timing and Dates": "bg-green-100 text-green-800",
  "NOC": "bg-yellow-100 text-yellow-800",
  "Selection and Offer Letter": "bg-purple-100 text-purple-800",
  "Work and Mentorship": "bg-red-100 text-red-800",
  "Communication Channels": "bg-pink-100 text-pink-800",
  "Interviews": "bg-indigo-100 text-indigo-800",
  "Certificate": "bg-teal-100 text-teal-800",
  "Rosetta": "bg-orange-100 text-orange-800",
  "Phase 1 and Coursework": "bg-cyan-100 text-cyan-800",
  "Yaksha Chat": "bg-lime-100 text-lime-800",
  "ViBe Platform": "bg-rose-100 text-rose-800",
  "Team Formation": "bg-amber-100 text-amber-800",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [trendingFaqs, setTrendingFaqs] = useState([]);
  const [recentFaqs, setRecentFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/announcements").then((res) => {
      setAnnouncements(res.data.slice(0, 2));
    });
    api.get("/faqs/trending").then((res) => setTrendingFaqs(res.data));
    api.get("/faqs/recent").then((res) => setRecentFaqs(res.data));
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchPerformed(true);
    api.get(`/faqs?search=${encodeURIComponent(searchQuery)}`).then((res) => {
      setSearchResults(res.data);
      setSearchLoading(false);
    }).catch(() => {
      setSearchLoading(false);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 py-3 space-y-2">
            {announcements.map((a) => (
              <div key={a._id} className="flex gap-2 text-sm">
                <span className="font-bold text-amber-800 whitespace-nowrap">📢 {a.title}:</span>
                <span className="text-amber-700">{a.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-gray-800">FAQ System</span>
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <span className="text-sm text-gray-600">
                  Hi, {currentUser.username}
                  {currentUser.role === "admin" && (
                    <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* Hero + Search */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">FAQ Management System</h1>
          <p className="text-gray-500 text-lg">Search for answers or browse by category</p>
          <div className="flex max-w-xl mx-auto gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search FAQs..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h2>
            {searchResults.length === 0 ? (
              <p className="text-gray-500">
                No FAQs found. Try asking in{" "}
                <button
                  onClick={() => navigate("/discussions")}
                  className="text-blue-600 hover:underline"
                >
                  Discussions
                </button>
                .
              </p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((faq) => (
                  <div key={faq._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <p className="font-semibold text-gray-900">{faq.question}</p>
                    <p className="text-gray-600 text-sm mt-1">{faq.answer}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${CATEGORY_COLORS[faq.category] || "bg-gray-100 text-gray-700"}`}>
                      {faq.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(`/discussions?category=${encodeURIComponent(cat)}`)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trending FAQs */}
        {trendingFaqs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔥 Trending FAQs</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {trendingFaqs.map((faq) => (
                <div key={faq._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-900">{faq.question}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {faq.answer.length > 100 ? faq.answer.slice(0, 100) + "..." : faq.answer}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <span>👍 {faq.upvotes}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[faq.category] || "bg-gray-100 text-gray-700"}`}>
                      {faq.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent FAQs */}
        {recentFaqs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Recently Added FAQs</h2>
            <div className="space-y-3">
              {recentFaqs.map((faq) => (
                <div key={faq._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <p className="font-semibold text-gray-900">{faq.question}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {faq.answer.length > 100 ? faq.answer.slice(0, 100) + "..." : faq.answer}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[faq.category] || "bg-gray-100 text-gray-700"}`}>
                      {faq.category}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(faq.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussions CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium">Can't find what you're looking for?</p>
          <p className="text-blue-600 text-sm mt-1">
            Ask the community in the{" "}
            <button
              onClick={() => navigate("/discussions")}
              className="text-blue-700 font-semibold hover:underline"
            >
              Discussions
            </button>{" "}
            section.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-sm text-gray-400">
          FAQ Management System | Help | Support
        </div>
      </footer>
    </div>
  );
}