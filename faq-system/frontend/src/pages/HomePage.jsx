import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { name: "About the Internship", icon: "🏢", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", hover: "hover:bg-blue-50" },
  { name: "Timing and Dates", icon: "📅", color: "from-green-500 to-green-600", bg: "bg-green-50", border: "border-green-200", text: "text-green-700", hover: "hover:bg-green-50" },
  { name: "NOC", icon: "📋", color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", hover: "hover:bg-yellow-50" },
  { name: "Selection and Offer Letter", icon: "🎓", color: "from-purple-500 to-purple-600", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", hover: "hover:bg-purple-50" },
  { name: "Work and Mentorship", icon: "💼", color: "from-red-500 to-red-600", bg: "bg-red-50", border: "border-red-200", text: "text-red-700", hover: "hover:bg-red-50" },
  { name: "Communication Channels", icon: "💬", color: "from-pink-500 to-pink-600", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", hover: "hover:bg-pink-50" },
  { name: "Interviews", icon: "🎯", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", hover: "hover:bg-indigo-50" },
  { name: "Certificate", icon: "📜", color: "from-teal-500 to-teal-600", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", hover: "hover:bg-teal-50" },
  { name: "Rosetta", icon: "🪨", color: "from-orange-500 to-orange-600", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", hover: "hover:bg-orange-50" },
  { name: "Phase 1 and Coursework", icon: "📚", color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", hover: "hover:bg-cyan-50" },
  { name: "Yaksha Chat", icon: "💭", color: "from-lime-500 to-lime-600", bg: "bg-lime-50", border: "border-lime-200", text: "text-lime-700", hover: "hover:bg-lime-50" },
  { name: "ViBe Platform", icon: "🎨", color: "from-rose-500 to-rose-600", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", hover: "hover:bg-rose-50" },
  { name: "Team Formation", icon: "👥", color: "from-amber-500 to-amber-600", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hover: "hover:bg-amber-50" },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function SkeletonCard({ lines = 2 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-slate-100 rounded w-full mb-2" style={{ width: `${85 - i * 15}%` }} />
      ))}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
        <div className="h-5 bg-slate-100 rounded-full w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-12" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [trendingFaqs, setTrendingFaqs] = useState([]);
  const [recentFaqs, setRecentFaqs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, trendRes, recentRes] = await Promise.all([
        api.get("/announcements"),
        api.get("/faqs/trending"),
        api.get("/faqs/recent"),
      ]);
      setAnnouncements(annRes.data.slice(0, 3));
      setTrendingFaqs(trendRes.data);
      setRecentFaqs(recentRes.data);
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHomeData(); }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchPerformed(true);
    api.get("/faqs?search=" + encodeURIComponent(searchQuery)).then((res) => {
      setSearchResults(res.data);
    }).catch(() => {}).finally(() => setSearchLoading(false));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchPerformed(false);
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Announcement Banner */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-lg">📢</span>
              <div className="flex-1 min-w-0">
                {announcements.map((a, i) => (
                  <div key={a._id} className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm whitespace-nowrap">{a.title}</span>
                    <span className="text-amber-100 text-sm truncate">{a.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live FAQ Database — 100+ Answers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Everything about your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
                Internship
              </span>
            </h1>
            <p className="text-indigo-200 text-lg sm:text-xl max-w-2xl mx-auto">
              Find answers instantly or browse by category. Can't find yours? Ask the community.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-2xl">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search 100+ FAQs..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-60"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
              {searchPerformed && (
                <button onClick={clearSearch} className="mt-2 text-sm text-indigo-200 hover:text-white transition-colors">
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Search Results */}
        {searchPerformed && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Search Results
                <span className="ml-2 text-base font-normal text-slate-400">({searchResults.length} found)</span>
              </h2>
              <button onClick={clearSearch} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                ✕ Clear
              </button>
            </div>
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-slate-500 text-lg font-medium mb-2">No results for "{searchQuery}"</p>
                <p className="text-slate-400 text-sm mb-4">Try different keywords or browse categories below</p>
                <button onClick={() => navigate("/discussions")} className="text-indigo-600 font-medium text-sm hover:underline">
                  Ask in Discussions →
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {searchResults.map((faq) => (
                  <div key={faq._id} className="faq-card bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer"
                    onClick={() => navigate("/faqs/" + encodeURIComponent(faq.category))}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-base leading-snug">{faq.question}</h3>
                        <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{faq.answer}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={"badge " + (CATEGORIES.find(c => c.name === faq.category)?.bg || "bg-slate-100") + " " + (CATEGORIES.find(c => c.name === faq.category)?.text || "text-slate-600")}>
                            {faq.category}
                          </span>
                          <span className="text-xs text-slate-400">👍 {faq.upvotes || 0}</span>
                        </div>
                      </div>
                      <span className="text-2xl opacity-40 shrink-0">💡</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Browse Categories</h2>
              <p className="text-slate-400 text-sm mt-1">Click any category to explore FAQs</p>
            </div>
            <button onClick={() => navigate("/discussions")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              View all discussions →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate("/faqs/" + encodeURIComponent(cat.name))}
                className={"group relative bg-white rounded-2xl border border-slate-200 p-4 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 active:scale-95 overflow-hidden " + cat.hover}
              >
                <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + cat.color + " flex items-center justify-center text-xl mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform" }>
                  {cat.icon}
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-tight">{cat.name}</p>
                <div className={"absolute inset-0 bg-gradient-to-br " + cat.color + " opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl"} />
              </button>
            ))}
          </div>
        </section>

        {/* Trending FAQs */}
        {!searchPerformed && trendingFaqs.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-lg shadow-sm">🔥</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Trending FAQs</h2>
                <p className="text-slate-400 text-sm">Most upvoted by the community</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingFaqs.map((faq, i) => (
                <div key={faq._id} className="faq-card bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer group"
                  onClick={() => navigate("/faqs/" + encodeURIComponent(faq.category))}>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{faq.answer}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={"badge " + (CATEGORIES.find(c => c.name === faq.category)?.bg || "bg-slate-100") + " " + (CATEGORIES.find(c => c.name === faq.category)?.text || "text-slate-600")}>
                          {faq.icon} {faq.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span>👍</span><span>{faq.upvotes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span>📅</span><span>{formatDate(faq.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent FAQs */}
        {!searchPerformed && recentFaqs.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-lg shadow-sm">📋</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Recently Added</h2>
                <p className="text-slate-400 text-sm">Latest additions to the FAQ database</p>
              </div>
            </div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentFaqs.map((faq) => (
                  <div key={faq._id} className="faq-card bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer group"
                    onClick={() => navigate("/faqs/" + encodeURIComponent(faq.category))}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                          {faq.question}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{faq.answer}</p>
                      </div>
                      <span className="text-lg opacity-30 shrink-0 group-hover:opacity-60 transition-opacity">📌</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                      <span className={"badge " + (CATEGORIES.find(c => c.name === faq.category)?.bg || "bg-slate-100") + " " + (CATEGORIES.find(c => c.name === faq.category)?.text || "text-slate-600")}>
                        {faq.category}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">{formatDate(faq.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Discussions CTA */}
        {!searchPerformed && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative p-10 sm:p-14 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Can't find what you need?</h2>
              <p className="text-indigo-200 text-lg mb-6 max-w-md mx-auto">
                Ask the community or browse unapproved questions in the Discussions section.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate("/discussions")}
                  className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                >
                  Browse Discussions
                </button>
                <button
                  onClick={() => navigate("/discussions")}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl text-sm hover:bg-white/20 transition-all active:scale-95"
                >
                  Ask a Question
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <p className="text-white font-bold text-lg">FAQ System</p>
                <p className="text-xs text-slate-500">Internship Knowledge Base</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => navigate("/discussions")} className="hover:text-white transition-colors">Discussions</button>
              {currentUser?.role === "admin" && (
                <button onClick={() => navigate("/admin")} className="hover:text-white transition-colors">Admin Panel</button>
              )}
            </div>
            <p className="text-xs text-slate-600">© 2026 FAQ System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}