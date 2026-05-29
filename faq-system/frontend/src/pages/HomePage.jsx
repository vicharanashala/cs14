import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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

const ACCENT = {
  indigo: ["from-indigo-500 to-blue-500", "bg-indigo-50", "text-indigo-600", "border-indigo-200"],
  emerald: ["from-emerald-500 to-teal-500", "bg-emerald-50", "text-emerald-600", "border-emerald-200"],
  amber: ["from-amber-500 to-orange-500", "bg-amber-50", "text-amber-600", "border-amber-200"],
  purple: ["from-purple-500 to-fuchsia-500", "bg-purple-50", "text-purple-600", "border-purple-200"],
  rose: ["from-rose-500 to-pink-500", "bg-rose-50", "text-rose-600", "border-rose-200"],
  pink: ["from-pink-500 to-rose-500", "bg-pink-50", "text-pink-600", "border-pink-200"],
  blue: ["from-blue-500 to-cyan-500", "bg-blue-50", "text-blue-600", "border-blue-200"],
  teal: ["from-teal-500 to-green-500", "bg-teal-50", "text-teal-600", "border-teal-200"],
  orange: ["from-orange-500 to-amber-500", "bg-orange-50", "text-orange-600", "border-orange-200"],
  cyan: ["from-cyan-500 to-blue-500", "bg-cyan-50", "text-cyan-600", "border-cyan-200"],
  lime: ["from-lime-500 to-green-500", "bg-lime-50", "text-lime-600", "border-lime-200"],
  fuchsia: ["from-fuchsia-500 to-purple-500", "bg-fuchsia-50", "text-fuchsia-600", "border-fuchsia-200"],
  yellow: ["from-yellow-500 to-amber-500", "bg-yellow-50", "text-yellow-700", "border-yellow-200"],
};

function StoryCard({ cat, onClick }) {
  const [g, b, t, bd] = ACCENT[cat.hue] || ACCENT.indigo;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group shrink-0">
      <div className={"w-14 h-14 rounded-2xl bg-gradient-to-br " + g + " flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200"}>
        {cat.icon}
      </div>
      <span className="text-xs font-semibold text-slate-600 text-center leading-tight line-clamp-2 w-16">{cat.name.split(" ")[0]}</span>
    </button>
  );
}

function TrendingCard({ faq, rank, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 text-left group"
    >
      <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors shrink-0 w-7 leading-none mt-0.5">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{faq.question}</p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <span>👍 {faq.upvotes || 0}</span>
          <span>·</span>
          <span>{faq.category}</span>
        </p>
      </div>
      <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function CategoryCard({ cat, onClick }) {
  const [g, b, t, bd] = ACCENT[cat.hue] || ACCENT.indigo;
  return (
    <button
      onClick={onClick}
      className={"flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all duration-200 text-left w-full group animate-popIn" +
        (b && t && bd ? ` bg-opacity-60` : "")}
    >
      <div className={"w-11 h-11 rounded-xl bg-gradient-to-br " + g + " flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"}>
        {cat.icon}
      </div>
      <span className={"text-sm font-bold " + t + " flex-1"}>{cat.name}</span>
      <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [allFaqs, setAllFaqs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/announcements").then((r) => r.data).catch(() => []),
      api.get("/faqs").then((r) => r.data).catch(() => []),
    ]).then(([ann, faqs]) => {
      setAnnouncements(ann);
      setAllFaqs(faqs);
      setLoading(false);
    });
  }, []);

  const trending = [...allFaqs].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 5);
  const recent = [...allFaqs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const liveAnn = announcements.find((a) => a.isLive) || announcements[0];

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) { setSearchResults(null); return; }
    const q = search.toLowerCase();
    setSearchResults(allFaqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)));
  }

  function goToCategory(cat) {
    navigate("/faqs/" + encodeURIComponent(cat));
  }

  const filteredByCat = categoryFilter
    ? allFaqs.filter((f) => f.category === categoryFilter)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-5 pb-28 md:pb-10 space-y-8">

      {/* ── Hero / Search ── */}
      <section className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-600 mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Internship FAQ System — Live
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">
          Find answers to your<br />
          <span className="gradient-text">internship questions</span>
        </h1>
        <p className="text-slate-500 text-sm mb-6">Everything you need to know, in one place</p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
          <div className="flex items-center bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm focus-within:border-indigo-400 focus-within:shadow-md transition-all">
            <span className="pl-4 text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSearchResults(null); }}
              placeholder="Search FAQs..."
              className="flex-1 px-3 py-3.5 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 border-none focus:ring-0"
            />
            <button type="submit" className="btn-primary m-1.5 px-5 py-2 text-sm rounded-xl">
              Search
            </button>
          </div>
        </form>

        {/* Search results */}
        {searchResults !== null && (
          <div className="mt-4 max-w-lg mx-auto text-left animate-fadeIn">
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</p>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-md">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">No FAQs found. Try a different keyword.</div>
              ) : (
                searchResults.slice(0, 8).map((f) => (
                  <button key={f._id} onClick={() => goToCategory(f.category)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
                    <span className="text-lg mt-0.5">{CATEGORIES.find((c) => c.name === f.category)?.icon || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{f.question}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{f.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Live Announcement Banner ── */}
      {liveAnn && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl px-5 py-4 shadow-lg shadow-indigo-500/20 animate-popIn">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">📢</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm">{liveAnn.title}</p>
            <p className="text-indigo-200 text-xs mt-0.5 line-clamp-1">{liveAnn.content}</p>
          </div>
          <span className="shrink-0 hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        </div>
      )}

      {/* ── Category Stories Strip ── */}
      <section>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <StoryCard key={cat.name} cat={cat} onClick={() => goToCategory(cat.name)} />
          ))}
        </div>
      </section>

      {/* ── Trending & Recent ── */}
      {!loading && (trending.length > 0 || recent.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔥</span>
              <h2 className="text-base font-extrabold text-slate-900">Trending</h2>
            </div>
            <div className="space-y-2">
              {trending.map((f, i) => (
                <TrendingCard key={f._id} faq={f} rank={i + 1} onClick={() => goToCategory(f.category)} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <h2 className="text-base font-extrabold text-slate-900">Recent</h2>
            </div>
            <div className="space-y-2">
              {recent.map((f, i) => (
                <TrendingCard key={f._id} faq={f} rank={i + 1} onClick={() => goToCategory(f.category)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skeleton */}
      {loading && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[[1, 2, 3], [4, 5, 6]].map((col, ci) => (
            <div key={ci} className="space-y-2">
              {col.map((n) => (
                <div key={n} className="h-16 bg-slate-200 rounded-2xl skeleton" />
              ))}
            </div>
          ))}
        </section>
      )}

      {/* ── Browse by Category ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">Browse Categories</h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:border-indigo-300 transition-all cursor-pointer"
          >
            <option value="">All topics</option>
            {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {/* Filtered cat results */}
        {filteredByCat.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {filteredByCat.map((f) => {
              const cat = CATEGORIES.find((c) => c.name === f.category) || CATEGORIES[0];
              return (
                <button key={f._id} onClick={() => goToCategory(f.category)}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all text-left group animate-fadeIn">
                  <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + (ACCENT[cat.hue]?.[0] || ACCENT.indigo[0]) + " flex items-center justify-center text-lg shadow-sm"}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">{f.question}</p>
                    <p className="text-xs text-slate-400 mt-1">👍 {f.upvotes || 0} · {f.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : categoryFilter ? (
          <div className="text-center py-10 text-slate-400 text-sm">No FAQs in this category yet.</div>
        ) : null}

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(categoryFilter ? CATEGORIES.filter((c) => c.name === categoryFilter) : CATEGORIES).map((cat, i) => (
            <CategoryCard key={cat.name} cat={cat} onClick={() => goToCategory(cat.name)} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="text-center py-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl px-6 py-8 shadow-xl">
          <h3 className="text-white font-extrabold text-xl mb-2">Couldn't find the answer?</h3>
          <p className="text-slate-400 text-sm mb-6">Ask the community and get help from other interns</p>
          <button onClick={() => navigate("/discussions")}
            className="btn-primary px-8 py-3 text-sm">
            💬 Ask a Question — It's free
          </button>
        </div>
      </section>
    </div>
  );
}