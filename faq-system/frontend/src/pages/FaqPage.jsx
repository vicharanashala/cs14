import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function FaqPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const decodedCategory = decodeURIComponent(category || "");
  const isValidCategory = CATEGORIES.includes(decodedCategory);

  useEffect(() => {
    if (!isValidCategory) {
      navigate("/");
      return;
    }
    setSearchQuery("");
    setSearchPerformed(false);
    setSearchResults([]);
    setExpandedId(null);
    fetchFaqs();
  }, [category]);

  const fetchFaqs = () => {
    setLoading(true);
    api.get("/faqs?category=" + encodeURIComponent(decodedCategory))
      .then((res) => setFaqs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchPerformed(false);
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchPerformed(true);
    api.get("/faqs?category=" + encodeURIComponent(decodedCategory) + "&search=" + encodeURIComponent(searchQuery.trim()))
      .then((res) => setSearchResults(res.data))
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const displayFaqs = searchPerformed ? searchResults : faqs;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 p-4 shrink-0">
        <h3 className="font-semibold text-gray-700 mb-3">Categories</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate("/faqs/" + encodeURIComponent(cat))}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                decodedCategory === cat
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            to="/discussions"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            💬 Discussions
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-xs px-2 py-1 rounded font-medium ${CATEGORY_COLORS[decodedCategory] || "bg-gray-100 text-gray-700"}`}>
              {decodedCategory}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{decodedCategory}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Loading..." : `${faqs.length} FAQ${faqs.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Search within " + decodedCategory + "..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:bg-blue-400"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
            {searchPerformed && (
              <button
                onClick={() => { setSearchPerformed(false); setSearchQuery(""); }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : displayFaqs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No FAQs found in this category.</p>
            <p className="text-sm text-gray-400">
              Can't find what you need?{" "}
              <Link to="/discussions" className="text-blue-600 hover:underline">
                Ask in Discussions
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayFaqs.map((faq) => (
              <div key={faq._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                  className="w-full text-left px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">{faq.question}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[faq.category] || "bg-gray-100 text-gray-700"}`}>
                        {faq.category}
                      </span>
                      {faq.status && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                          {faq.status}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">👍 {faq.upvotes || 0}</span>
                      <span className="text-xs text-gray-400">{formatDate(faq.createdAt)}</span>
                    </div>
                  </div>
                  <span className={"shrink-0 text-gray-400 transition-transform " + (expandedId === faq._id ? "rotate-180" : "")}>
                    ▼
                  </span>
                </button>

                {expandedId === faq._id && (
                  <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(faq.answer, faq._id); }}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {copiedId === faq._id ? "✓ Copied" : "Copy Answer"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}