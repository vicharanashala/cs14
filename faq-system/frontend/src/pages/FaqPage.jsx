import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { name: "About the Internship", icon: "🏢", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-700", light: "bg-blue-100" },
  { name: "Timing and Dates", icon: "📅", color: "from-green-500 to-green-600", bg: "bg-green-50", text: "text-green-700", light: "bg-green-100" },
  { name: "NOC", icon: "📋", color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-50", text: "text-yellow-700", light: "bg-yellow-100" },
  { name: "Selection and Offer Letter", icon: "🎓", color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-700", light: "bg-purple-100" },
  { name: "Work and Mentorship", icon: "💼", color: "from-red-500 to-red-600", bg: "bg-red-50", text: "text-red-700", light: "bg-red-100" },
  { name: "Communication Channels", icon: "💬", color: "from-pink-500 to-pink-600", bg: "bg-pink-50", text: "text-pink-700", light: "bg-pink-100" },
  { name: "Interviews", icon: "🎯", color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-700", light: "bg-indigo-100" },
  { name: "Certificate", icon: "📜", color: "from-teal-500 to-teal-600", bg: "bg-teal-50", text: "text-teal-700", light: "bg-teal-100" },
  { name: "Rosetta", icon: "🪨", color: "from-orange-500 to-orange-600", bg: "bg-orange-50", text: "text-orange-700", light: "bg-orange-100" },
  { name: "Phase 1 and Coursework", icon: "📚", color: "from-cyan-500 to-cyan-600", bg: "bg-cyan-50", text: "text-cyan-700", light: "bg-cyan-100" },
  { name: "Yaksha Chat", icon: "💭", color: "from-lime-500 to-lime-600", bg: "bg-lime-50", text: "text-lime-700", light: "bg-lime-100" },
  { name: "ViBe Platform", icon: "🎨", color: "from-rose-500 to-rose-600", bg: "bg-rose-50", text: "text-rose-700", light: "bg-rose-100" },
  { name: "Team Formation", icon: "👥", color: "from-amber-500 to-amber-600", bg: "bg-amber-50", text: "text-amber-700", light: "bg-amber-100" },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function SkeletonItem() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="h-3 bg-slate-100 rounded w-full mb-2" />
      <div className="h-3 bg-slate-100 rounded w-2/3 mb-3" />
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <div className="h-5 bg-slate-100 rounded-full w-20" />
        <div className="h-5 bg-slate-100 rounded-full w-16" />
      </div>
    </div>
  );
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const decodedCategory = decodeURIComponent(category || "");
  const catMeta = CATEGORIES.find((c) => c.name === decodedCategory);
  const isValidCategory = CATEGORIES.some((c) => c.name === decodedCategory);

  useEffect(() => {
    if (!isValidCategory) { navigate("/"); return; }
    setSearchQuery("");
    setSearchPerformed(false);
    setSearchResults([]);
    setExpandedId(null);
    setSidebarOpen(false);
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
    if (!searchQuery.trim()) { setSearchPerformed(false); setSearchResults([]); return; }
    setSearchLoading(true);
    setSearchPerformed(true);
    api.get("/faqs?category=" + encodeURIComponent(decodedCategory) + "&search=" + encodeURIComponent(searchQuery.trim()))
      .then((res) => setSearchResults(res.data))
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const displayFaqs = searchPerformed ? searchResults : faqs;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={"fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-5 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shrink-0 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm">📚</div>
            <span className="font-bold text-slate-800">FAQ System</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-700 text-lg">✕</button>
        </div>

        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
        <nav className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = decodedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => { navigate("/faqs/" + encodeURIComponent(cat.name)); setSidebarOpen(false); }}
                className={"w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 " + (
                  isActive
                    ? "bg-gradient-to-r " + cat.color + " text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="flex-1 leading-tight">{cat.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-slate-200 space-y-1">
          <button onClick={() => { navigate("/"); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all">
            🏠 <span>Home</span>
          </button>
          <button onClick={() => { navigate("/discussions"); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-all">
            💬 <span>Discussions</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-800 p-1">
              <span className="text-xl">☰</span>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {catMeta && (
                  <span className={"w-8 h-8 rounded-xl bg-gradient-to-br " + catMeta.color + " flex items-center justify-center text-base shadow-sm"}>
                    {catMeta.icon}
                  </span>
                )}
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">{decodedCategory}</h1>
              </div>
              <p className="text-sm text-slate-400">
                {loading ? "Loading..." : `${faqs.length} approved FAQ${faqs.length !== 1 ? "s" : ""}`}
                {currentUser && <span className="ml-2 text-indigo-500 font-medium">— {currentUser.username}</span>}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={"Search within " + decodedCategory + "..."}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white transition-all"
              />
            </div>
            <button onClick={handleSearch} disabled={searchLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 active:scale-95">
              {searchLoading ? "..." : "Search"}
            </button>
            {searchPerformed && (
              <button onClick={() => { setSearchPerformed(false); setSearchQuery(""); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm rounded-xl transition-all">
                ✕
              </button>
            )}
          </div>
        </header>

        {/* FAQ List */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 4, 6].map((i) => <SkeletonItem key={i} />)}
            </div>
          ) : displayFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-slate-500 font-medium text-lg mb-2">
                {searchPerformed ? "No results for \"" + searchQuery + "\"" : "No FAQs in this category yet"}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {searchPerformed ? "Try different keywords" : "Be the first to add one!"}
              </p>
              <button onClick={() => navigate("/discussions")}
                className="text-indigo-600 font-medium text-sm hover:underline">
                Ask in Discussions →
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayFaqs.map((faq) => {
                const meta = CATEGORIES.find((c) => c.name === faq.category);
                return (
                  <div key={faq._id} className="faq-card bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {/* Card Header */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {meta && (
                            <span className={"inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg mb-2 " + meta.bg + " " + meta.text}>
                              {meta.icon} {faq.category}
                            </span>
                          )}
                          <h3 className="font-semibold text-slate-800 text-sm leading-snug">{faq.question}</h3>
                        </div>
                        <button
                          onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                          className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center text-xs transition-all"
                        >
                          {expandedId === faq._id ? "▲" : "▼"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Answer */}
                    {expandedId === faq._id ? (
                      <div className="px-5 pb-4">
                        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                          {faq.answer}
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleCopy(faq.answer, faq._id)}
                            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                            {copiedId === faq._id ? "✓ Copied" : "📋 Copy"}
                          </button>
                          <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
                            <span>👍</span><span>{faq.upvotes || 0}</span>
                            <span className="mx-1">•</span>
                            <span>📅</span><span>{formatDate(faq.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 pb-4">
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{faq.answer}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">👍 {faq.upvotes || 0}</span>
                          <span className="text-xs text-slate-400 ml-auto">Click to expand →</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}