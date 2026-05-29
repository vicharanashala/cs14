import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Tag, MessageCircle, Users, Search, TrendingUp, ChevronRight, Megaphone, X, AlertCircle, MessageSquare, ExternalLink } from "lucide-react";
import api from "../api/axios";

const CATEGORIES = [
  { name: "About the Internship", icon: "🏢", desc: "Overview, eligibility, expectations", count: 12 },
  { name: "Timing and Dates", icon: "📅", desc: "Important dates and deadlines", count: 5 },
  { name: "NOC", icon: "📄", desc: "No Objection Certificate queries", count: 13 },
  { name: "Selection and Offer Letter", icon: "🎓", desc: "Selection process and offers", count: 26 },
  { name: "Work and Mentorship", icon: "💼", desc: "Roles, responsibilities, mentors", count: 4 },
  { name: "Communication Channels", icon: "📡", desc: "Slack, email, emergency contacts", count: 2 },
  { name: "Interviews", icon: "🎤", desc: "Interview process and tips", count: 0 },
  { name: "Certificate", icon: "📜", desc: "Certificate issuance and details", count: 0 },
  { name: "Rosetta", icon: "🔤", desc: "Language learning platform", count: 5 },
  { name: "Phase 1 and Coursework", icon: "📚", desc: "Course structure and grading", count: 8 },
  { name: "Yaksha Chat", icon: "💬", desc: "Yaksha platform questions", count: 0 },
  { name: "ViBe Platform", icon: "💻", desc: "ViBe tool and features", count: 21 },
  { name: "Team Formation", icon: "🏗️", desc: "Team setup and collaboration", count: 17 },
];

const STATS = [
  { label: "Total FAQs", value: "105+", icon: BookOpen, color: "from-indigo-500 to-blue-500" },
  { label: "Categories", value: "13", icon: Tag, color: "from-purple-500 to-pink-500" },
  { label: "Discussions", value: "6", icon: MessageCircle, color: "from-amber-500 to-orange-500" },
  { label: "Weekly Users", value: "200+", icon: Users, color: "from-emerald-500 to-teal-500" },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "Smart Search",
    desc: "Find answers instantly with our AI-powered search across all categories.",
  },
  {
    icon: "💬",
    title: "Community Discussions",
    desc: "Ask questions, share experiences, and get answers from fellow interns.",
  },
  {
    icon: "✅",
    title: "Vetted Answers",
    desc: "Every FAQ is verified by the admin team before publication.",
  },
  {
    icon: "📊",
    title: "Real-time Updates",
    desc: "Stay current with the latest announcements and policy changes.",
  },
];

// ── Notice Board Widget ──────────────────────────────────────
function NoticeBoard({ announcements }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  if (!announcements.length || !visible) return null;
  const current = announcements[idx];

  const next = () => { setIdx((i) => (i + 1) % announcements.length); };
  const prev = () => { setIdx((i) => (i - 1 + announcements.length) % announcements.length); };

  useEffect(() => {
    if (paused || announcements.length <= 1) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [paused, announcements.length]);

  return (
    <div className="mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-2xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-amber-200 dark:bg-amber-900/50 border-b border-amber-300 dark:border-amber-700">
        <div className="flex items-center gap-2">
          <Megaphone size={13} className="text-amber-800 dark:text-amber-300" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">Notice Board</span>
        </div>
        <div className="flex items-center gap-2">
          {announcements.length > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={prev} className="w-5 h-5 rounded flex items-center justify-center hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors text-[10px] font-bold text-amber-800 dark:text-amber-200">‹</button>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 min-w-[20px] text-center">{idx + 1}/{announcements.length}</span>
              <button onClick={next} className="w-5 h-5 rounded flex items-center justify-center hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors text-[10px] font-bold text-amber-800 dark:text-amber-200">›</button>
            </div>
          )}
          <button onClick={() => setVisible(false)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors">
            <X size={10} className="text-amber-700 dark:text-amber-300" />
          </button>
        </div>
      </div>
      {/* Content */}
      <div
        className="px-4 py-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
        onClick={() => {}}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <p className="text-xs font-bold text-gray-900 dark:text-amber-50">{current.title}</p>
        <p className="text-[11px] text-gray-700 dark:text-amber-200 mt-0.5 line-clamp-2 leading-relaxed">{current.content}</p>
      </div>
    </div>
  );
}

// ── Trending FAQs ─────────────────────────────────────────────
function TrendingFaqs({ faqs }) {
  const navigate = useNavigate();
  if (!faqs.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center">
            <TrendingUp size={15} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[rgb(var(--text-primary))]">Trending FAQs</h2>
            <p className="text-[11px] text-[rgb(var(--text-tertiary))]">Most viewed questions this week</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/all-faqs")}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
        >
          View all <ChevronRight size={12} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {faqs.map((faq) => (
          <button
            key={faq._id}
            onClick={() => navigate(`/faqs/${encodeURIComponent(faq.category || "General")}?highlight=${faq._id}`)}
            className="group text-left bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 card-hover"
          >
            <div className="flex items-start gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp size={12} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-[rgb(var(--text-primary))] group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                {faq.question}
              </p>
            </div>
            {faq.answer && (
              <p className="text-[11px] text-[rgb(var(--text-tertiary))] line-clamp-2 ml-9 leading-relaxed">{faq.answer}</p>
            )}
            <div className="flex items-center gap-2 mt-2 ml-9">
              <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{faq.category}</span>
              <span className="text-[10px] text-[rgb(var(--text-tertiary))]">·</span>
              <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{faq.views || 0} views</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Can't Find Answer CTA ─────────────────────────────────────
function CantFindCta() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-10 text-center text-white relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} color="white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-2">Can't find your answer?</h2>
          <p className="text-indigo-200 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Didn't find what you were looking for? Reach out to the community or contact an admin for personalized help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/discussions"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <MessageSquare size={15} />
              Ask the Community
            </a>
            <a
              href="mailto:support@vicharanashala.com"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/30 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={15} />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main HomePage ─────────────────────────────────────────────
export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFaqs, setCategoryFaqs] = useState({});
  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/announcements").catch(() => ({ data: [] })),
      api.get("/faqs?limit=200").catch(() => ({ data: [] })),
    ]).then(([announcementsData, faqsData]) => {
      // axios interceptor unwraps response.data, so these are already arrays
      const announcementsArr = Array.isArray(announcementsData) ? announcementsData : (announcementsData?.data || []);
      const faqsArr = Array.isArray(faqsData) ? faqsData : (faqsData?.data || []);
      setAnnouncements(announcementsArr.slice(0, 3));
      const grouped = {};
      faqsArr.forEach((faq) => {
        if (!grouped[faq.category]) grouped[faq.category] = [];
        grouped[faq.category].push(faq);
      });
      setCategoryFaqs(grouped);
      setAllFaqs(faqsArr);
      setLoading(false);
    });
  }, []);

  // Trending = top viewed
  const trendingFaqs = [...allFaqs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchResults(null);
    setShowResults(false);
    // Navigate to all-faqs page with search query
    navigate(`/all-faqs?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults(null); setShowResults(false); return; }
    const results = allFaqs.filter(f =>
      f.question?.toLowerCase().includes(q.toLowerCase()) ||
      f.answer?.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 6);
    setSearchResults(results);
    setShowResults(true);
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[rgb(var(--bg-surface))] border-b border-[rgb(var(--border-default))]">
        <div className="orb-gradient w-96 h-96 bg-indigo-500 top-0 left-1/4" />
        <div className="orb-gradient w-72 h-72 bg-purple-500 top-10 right-1/4" />
        <div className="orb-gradient w-64 h-64 bg-pink-500 bottom-0 left-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          {/* Announcement banner — high contrast fix */}
          {announcements.length > 0 && (
            <div className="mb-10 flex items-start gap-3 p-4 bg-amber-200 dark:bg-amber-900/40 border border-amber-400 dark:border-amber-700 rounded-2xl animate-fade-in">
              <span className="text-lg mt-0.5 shrink-0">📌</span>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-amber-50">{announcements[0].title}</p>
                <p className="text-xs text-gray-700 dark:text-amber-200 mt-0.5 line-clamp-2">{announcements[0].content}</p>
              </div>
            </div>
          )}

          {/* Hero text */}
          <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700 text-xs font-semibold text-indigo-800 dark:text-indigo-200 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live · Updated May 2025
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[rgb(var(--text-primary))] leading-tight mb-5">
              Everything you need to
              <span className="text-gradient block">know about your internship</span>
            </h1>
            <p className="text-lg text-[rgb(var(--text-secondary))] mb-8 max-w-xl mx-auto">
              The central knowledge base for all interns. Browse verified FAQs, join discussions, and find answers fast.
            </p>

            {/* Hero Search Input */}
            <form onSubmit={handleSearch} ref={searchRef} className="relative max-w-xl mx-auto mb-8">
              <div className="flex items-center bg-[rgb(var(--bg-surface))] border-2 border-[rgb(var(--border-default))] rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20 overflow-hidden focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-colors">
                <Search size={18} className="ml-4 mr-0 text-[rgb(var(--text-tertiary))] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults && setShowResults(true)}
                  placeholder="Search questions, topics, keywords..."
                  className="flex-1 px-4 py-3.5 bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] outline-none"
                />
                <button
                  type="submit"
                  className="m-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:shadow-md transition-shadow shrink-0"
                >
                  Search
                </button>
              </div>
              {/* Live search results dropdown */}
              {showResults && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl shadow-xl overflow-hidden z-20">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-[rgb(var(--text-tertiary))]">No results for "<span className="text-[rgb(var(--text-primary))]">{searchQuery}</span>"</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-[rgb(var(--border-default))]">
                        {searchResults.map((r) => (
                          <button
                            key={r._id}
                            onClick={() => {
                              setShowResults(false);
                              setSearchQuery("");
                              navigate(`/faqs/${encodeURIComponent(r.category || "General")}?highlight=${r._id}`);
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[rgb(var(--bg-hover))] transition-colors"
                          >
                            <Search size={13} className="text-[rgb(var(--text-tertiary))] mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{r.question}</p>
                              <p className="text-[10px] text-[rgb(var(--text-tertiary))] mt-0.5">{r.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => { setShowResults(false); navigate(`/all-faqs?q=${encodeURIComponent(searchQuery)}`); }}
                        className="w-full py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-[rgb(var(--bg-hover))] border-t border-[rgb(var(--border-default))] transition-colors"
                      >
                        See all results for "{searchQuery}" →
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/all-faqs")}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Browse all FAQs →
              </button>
              <button
                onClick={() => navigate("/discussions")}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] text-sm font-semibold text-[rgb(var(--text-primary))] hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                Join discussions
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {STATS.map((stat) => {
              const IconComponent = stat.icon;
              return (
              <div key={stat.label}
                className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-4 text-center hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 mx-auto`}>
                  <IconComponent size={18} color="white" strokeWidth={2.5} />
                </div>
                <p className="text-2xl font-black text-[rgb(var(--text-primary))]">{stat.value}</p>
                <p className="text-xs text-[rgb(var(--text-tertiary))] font-medium">{stat.label}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Notice Board ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0">
        <NoticeBoard announcements={announcements} />
      </div>

      {/* ── Trending FAQs ────────────────────────────────────── */}
      {!loading && <TrendingFaqs faqs={trendingFaqs} />}

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">Built for interns, by admins</h2>
          <p className="text-sm text-[rgb(var(--text-secondary))]">Everything you need to navigate your internship journey</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {FEATURES.map((f) => (
            <div key={f.title}
              className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-5 card-hover">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-sm font-bold text-[rgb(var(--text-primary))] mb-1.5">{f.title}</h3>
              <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Browse by category</h2>
            <p className="text-sm text-[rgb(var(--text-tertiary))] mt-0.5">Pick a topic to explore verified FAQs</p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
            {CATEGORIES.length} categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 stagger-children">
          {CATEGORIES.map((cat) => {
            const hasFaqs = (categoryFaqs[cat.name] || []).length > 0;
            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/faqs/${encodeURIComponent(cat.name)}`)}
                className="group text-left bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-4 card-hover relative overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--bg-hover))] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[rgb(var(--text-primary))] truncate">{cat.name}</p>
                    <p className="text-xs text-[rgb(var(--text-tertiary))] mt-0.5 line-clamp-1">{cat.desc}</p>
                    {/* High-contrast pill fix */}
                    {hasFaqs && (
                      <span className="inline-flex items-center mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100">
                        {categoryFaqs[cat.name].length} FAQs
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Can't Find Answer CTA ────────────────────────────── */}
      <CantFindCta />

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-[rgb(var(--border-default))] bg-[rgb(var(--bg-surface))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                FAQ
              </div>
              <span className="text-sm font-bold text-[rgb(var(--text-primary))]">HelpDesk</span>
              <span className="text-xs text-[rgb(var(--text-tertiary))]">· Internship FAQ System</span>
            </div>
            <p className="text-xs text-[rgb(var(--text-tertiary))]">
              © 2025 HelpDesk · Built for the intern community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}