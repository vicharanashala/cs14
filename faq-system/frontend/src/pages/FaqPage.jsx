import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const HUE_ACCENT = {
  indigo: "from-indigo-500 to-blue-500",
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-500 to-orange-500",
  purple: "from-purple-500 to-fuchsia-500",
  rose: "from-rose-500 to-pink-500",
  pink: "from-pink-500 to-rose-500",
  blue: "from-blue-500 to-cyan-500",
  teal: "from-teal-500 to-green-500",
  orange: "from-orange-500 to-amber-500",
  cyan: "from-cyan-500 to-blue-500",
  lime: "from-lime-500 to-green-500",
  fuchsia: "from-fuchsia-500 to-purple-500",
  yellow: "from-yellow-500 to-amber-500",
};

export default function FaqPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentCat = CATEGORIES.find((c) => c.name === decodeURIComponent(category || ""));
  const gradient = HUE_ACCENT[currentCat?.hue || "indigo"];

  useEffect(() => {
    setLoading(true);
    setActiveAnswer(null);
    api.get("/faqs?category=" + encodeURIComponent(category || ""))
      .then((r) => setFaqs(r.data))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = faqs.filter(
    (f) => !searchQuery || f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function copyAnswer(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-5 pb-28 md:pb-10">
      {/* ── Mobile: sticky category header ── */}
      <div className="md:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 -mx-4 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
          ☰
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {currentCat && (
            <>
              <div className={"w-8 h-8 rounded-lg bg-gradient-to-br " + gradient + " flex items-center justify-center text-base shadow-sm shrink-0"}>
                {currentCat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 truncate">{currentCat.name}</p>
                <p className="text-xs text-slate-400">{faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 pt-4">

        {/* ── Left Sidebar (desktop + mobile overlay) ── */}
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-20 self-start gap-1">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-2">Categories</p>
          {CATEGORIES.map((cat) => {
            const isActive = cat.name === decodeURIComponent(category || "");
            return (
              <button
                key={cat.name}
                onClick={() => navigate("/faqs/" + encodeURIComponent(cat.name))}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left group ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <span className="text-base w-6 text-center">{cat.icon}</span>
                <span className="flex-1 truncate text-xs">{cat.name}</span>
              </button>
            );
          })}
        </aside>

        {/* Mobile overlay sidebar */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto animate-slideRight">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <p className="text-base font-extrabold text-slate-900">Categories</p>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
              </div>
              <div className="p-3 space-y-1">
                <button onClick={() => { setSidebarOpen(false); navigate("/"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700">
                  🏠 All FAQs
                </button>
                {CATEGORIES.map((cat) => {
                  const isActive = cat.name === decodeURIComponent(category || "");
                  return (
                    <button
                      key={cat.name}
                      onClick={() => { setSidebarOpen(false); navigate("/faqs/" + encodeURIComponent(cat.name)); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                        isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-base w-6 text-center">{cat.icon}</span>
                      <span className="flex-1 truncate text-xs">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Desktop header */}
          <div className="hidden md:flex items-center gap-3 mb-5">
            {currentCat && (
              <>
                <div className={"w-12 h-12 rounded-2xl bg-gradient-to-br " + gradient + " flex items-center justify-center text-2xl shadow-md"}>
                  {currentCat.icon}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">{currentCat.name}</h1>
                  <p className="text-sm text-slate-500">{faqs.length} frequently asked question{faqs.length !== 1 ? "s" : ""}</p>
                </div>
              </>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this category..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:border-indigo-400 shadow-sm transition-all"
            />
          </div>

          {/* FAQ list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((n) => <div key={n} className="h-24 bg-slate-200 rounded-2xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-slate-700 font-bold text-lg mb-1">No FAQs found</p>
              <p className="text-slate-400 text-sm mb-6">Be the first to ask about <strong>{currentCat?.name}</strong></p>
              <button onClick={() => navigate("/discussions")}
                className="btn-primary px-6 py-2.5 text-sm">
                Ask on Discussions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, idx) => (
                <div key={faq._id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden social-card animate-slideUp"
                  style={{ animationDelay: idx * 40 + "ms" }}
                >
                  {/* FAQ header */}
                  <button
                    className="w-full flex items-start gap-4 p-5 text-left"
                    onClick={() => setActiveAnswer(activeAnswer === faq._id ? null : faq._id)}
                  >
                    {/* Vote column */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                      <span className="text-sm font-extrabold text-slate-700">👍</span>
                      <span className="text-sm font-bold text-slate-800">{faq.upvotes || 0}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                          Q
                        </span>
                        <p className="text-sm font-bold text-slate-900 leading-snug">{faq.question}</p>
                      </div>

                      {/* Expanded answer */}
                      {activeAnswer === faq._id && (
                        <div className="mt-3 animate-slideDown">
                          <div className="h-px bg-slate-100 mb-3" />
                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); copyAnswer(faq.answer, faq._id); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                              >
                                {copiedId === faq._id ? "✓ Copied" : "📋 Copy"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <div className="shrink-0 pt-0.5">
                      <svg
                        className={"w-5 h-5 text-slate-400 transition-transform duration-200 " + (activeAnswer === faq._id ? "rotate-180" : "")}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}