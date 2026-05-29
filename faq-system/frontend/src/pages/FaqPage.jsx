import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

const HUE_MAP = {
  "About the Internship":    { from: "from-indigo-500", to: "to-indigo-600", accent: "text-indigo-500" },
  "Timing and Dates":         { from: "from-amber-500",  to: "to-orange-500",  accent: "text-amber-500" },
  "NOC":                      { from: "from-emerald-500",to: "teal-500",      accent: "text-emerald-500" },
  "Selection and Offer Letter":{ from: "from-purple-500", to: "to-pink-500",  accent: "text-purple-500" },
  "Work and Mentorship":      { from: "from-blue-500",   to: "to-cyan-500",   accent: "text-blue-500" },
  "Communication Channels":   { from: "from-teal-500",  to: "to-emerald-500",accent: "text-teal-500" },
  "Interviews":               { from: "from-rose-500",   to: "to-pink-500",   accent: "text-rose-500" },
  "Certificate":              { from: "from-yellow-500",  to: "to-amber-500",  accent: "text-yellow-500" },
  "Rosetta":                  { from: "from-fuchsia-500", to: "to-purple-500", accent: "text-fuchsia-500" },
  "Phase 1 and Coursework":   { from: "from-orange-500",  to: "to-red-500",    accent: "text-orange-500" },
  "Yaksha Chat":              { from: "from-violet-500",  to: "to-purple-500", accent: "text-violet-500" },
  "ViBe Platform":           { from: "from-sky-500",     to: "to-blue-500",   accent: "text-sky-500" },
  "Team Formation":          { from: "from-indigo-500",  to: "to-violet-500", accent: "text-indigo-500" },
};

const CATEGORY_ICONS = {
  "About the Internship": "🏢", "Timing and Dates": "📅", "NOC": "📄",
  "Selection and Offer Letter": "🎓", "Work and Mentorship": "💼", "Communication Channels": "📡",
  "Interviews": "🎤", "Certificate": "📜", "Rosetta": "🔤", "Phase 1 and Coursework": "📚",
  "Yaksha Chat": "💬", "ViBe Platform": "💻", "Team Formation": "🏗️",
};

export default function FaqPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(category || "");
  const hue = HUE_MAP[decoded] || { from: "from-indigo-500", to: "to-indigo-600", accent: "text-indigo-500" };
  const icon = CATEGORY_ICONS[decoded] || "📖";

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    setExpanded(null);
    api.get(`/faqs?category=${encodeURIComponent(decoded)}`)
      .then((r) => setFaqs(r.data || []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, [decoded]);

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    (f.answer || "").toLowerCase().includes(search.toLowerCase())
  );

  const copyAnswer = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-4rem)]">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Category header */}
        <div className={`mb-6 p-5 rounded-2xl bg-gradient-to-r ${hue.from} ${hue.to} text-white`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{icon}</span>
            <h1 className="text-xl font-black">{decoded}</h1>
          </div>
          <p className="text-white/80 text-sm">
            {loading ? "Loading..." : `${filtered.length} verified FAQ${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${decoded} FAQs...`}
            style={{ paddingLeft: "2.5rem" }}
            className="input-base pl-10"
          />
        </div>

        {/* FAQ list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl p-5">
                <div className="skeleton h-4 w-3/4 mb-3 rounded" />
                <div className="skeleton h-3 w-full mb-2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[rgb(var(--text-secondary))] text-sm">No FAQs found{search ? " for your search" : ""}</p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-indigo-500 hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filtered.map((faq, i) => {
              const isOpen = expanded === faq._id;
              return (
                <div
                  key={faq._id}
                  className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl overflow-hidden card-hover"
                >
                  {/* Question */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-start gap-3"
                    onClick={() => setExpanded(isOpen ? null : faq._id)}
                  >
                    <div className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isOpen ? `bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300` : "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-tertiary))]"
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-snug">{faq.question}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isOpen ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300" : "bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-tertiary))]"}`}>
                          {faq.category}
                        </span>
                        {faq.upvotes > 0 && (
                          <span className="text-[10px] text-[rgb(var(--text-tertiary))]">▲ {faq.upvotes} upvotes</span>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`shrink-0 mt-1 text-[rgb(var(--text-tertiary))] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Answer */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="ml-9 p-4 bg-[rgb(var(--bg-base))] dark:bg-[rgb(var(--bg-elevated))] rounded-xl border border-[rgb(var(--border-default))]">
                        <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                        <button
                          onClick={() => copyAnswer(faq.answer)}
                          className="mt-3 flex items-center gap-1.5 text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copy answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}