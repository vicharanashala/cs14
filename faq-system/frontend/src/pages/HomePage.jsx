import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  { label: "Total FAQs", value: "105+", icon: "📖", color: "from-indigo-500 to-blue-500" },
  { label: "Categories", value: "13", icon: "🏷️", color: "from-purple-500 to-pink-500" },
  { label: "Discussions", value: "6", icon: "💬", color: "from-amber-500 to-orange-500" },
  { label: "Weekly Users", value: "200+", icon: "👥", color: "from-emerald-500 to-teal-500" },
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

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFaqs, setCategoryFaqs] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/announcements").catch(() => ({ data: [] })),
      api.get("/faqs?limit=100").catch(() => ({ data: [] })),
    ]).then(([annRes, faqRes]) => {
      setAnnouncements(annRes.data.slice(0, 3));
      const grouped = {};
      (faqRes.data || []).forEach((faq) => {
        if (!grouped[faq.category]) grouped[faq.category] = [];
        grouped[faq.category].push(faq);
      });
      setCategoryFaqs(grouped);
      setLoading(false);
    });
  }, []);

  // Get recent FAQs across categories
  const recentFaqs = Object.values(categoryFaqs)
    .flat()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  // Popular = top upvoted
  const popularFaqs = Object.values(categoryFaqs)
    .flat()
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[rgb(var(--bg-surface))] border-b border-[rgb(var(--border-default))]">
        {/* Gradient orbs */}
        <div className="orb-gradient w-96 h-96 bg-indigo-500 top-0 left-1/4" />
        <div className="orb-gradient w-72 h-72 bg-purple-500 top-10 right-1/4" />
        <div className="orb-gradient w-64 h-64 bg-pink-500 bottom-0 left-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          {/* Announcement banner */}
          {announcements.length > 0 && (
            <div className="mb-10 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl animate-fade-in">
              <span className="text-lg">📌</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{announcements[0].title}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 line-clamp-2">{announcements[0].content}</p>
              </div>
            </div>
          )}

          {/* Hero text */}
          <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live · Updated May 2025
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[rgb(var(--text-primary))] leading-tight mb-5">
              Everything you need to
              <span className="text-gradient block">know about your internship</span>
            </h1>
            <p className="text-lg text-[rgb(var(--text-secondary))] mb-8 max-w-xl mx-auto">
              The central knowledge base for all interns. Browse verified FAQs, join discussions, and find answers fast.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/faqs/About the Internship")}
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
            {STATS.map((stat) => (
              <div key={stat.label}
                className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-4 text-center hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-2 mx-auto`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-black text-[rgb(var(--text-primary))]">{stat.value}</p>
                <p className="text-xs text-[rgb(var(--text-tertiary))] font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Browse by category</h2>
            <p className="text-sm text-[rgb(var(--text-tertiary))] mt-0.5">Pick a topic to explore verified FAQs</p>
          </div>
          <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
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
                    {hasFaqs && (
                      <span className="inline-flex items-center mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
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