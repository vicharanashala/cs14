import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Tag, MessageCircle, Users, Search, TrendingUp, ChevronRight, Megaphone, X, AlertCircle, MessageSquare, ExternalLink, HelpCircle, Send } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import CategoryCard from "../components/CategoryCard";
import ToastContainer, { toast } from "../components/Toast";
import { useCategories } from "../context/CategoryContext";

export default function HomePage() {
  const { categories } = useCategories();
  const [announcements, setAnnouncements] = useState([]);
  const [categoryFaqs, setCategoryFaqs] = useState({});
  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Recommendations tab state
  const [activeRecTab, setActiveRecTab] = useState("noc");

  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", content: "Hello! I am your IIT Ropar Internship Assistant. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Inquiry form state
  const [inquiry, setInquiry] = useState({ name: "", email: "", message: "" });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/announcements").catch(() => ({ data: [] })),
      api.get("/faqs?limit=200").catch(() => ({ data: [] })),
    ]).then(([announcementsData, faqsData]) => {
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

  // Feeds
  const trendingFaqs = [...allFaqs]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 4);

  const mostSearched = [...allFaqs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const recentlyAnswered = [...allFaqs]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/all-faqs?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults(null); setShowResults(false); return; }
    const results = allFaqs.filter(f =>
      f.question?.toLowerCase().includes(q.toLowerCase()) ||
      f.answer?.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 5);
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

  // Chatbot query submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      // client-side simple matching
      const matches = allFaqs.filter(f =>
        f.question?.toLowerCase().includes(userMsg.toLowerCase()) ||
        (f.answer || "").toLowerCase().includes(userMsg.toLowerCase())
      ).slice(0, 3);

      let reply = "";
      let links = [];

      if (matches.length > 0) {
        reply = "I found some relevant FAQs that might help you:";
        links = matches.map(m => ({
          title: m.question,
          path: `/faqs/${encodeURIComponent(m.category)}?highlight=${m._id}`
        }));
      } else {
        reply = "I couldn't find a direct match. Try checking the Discussions forum or submit a query to get admin support!";
      }

      setChatMessages((prev) => [...prev, { role: "bot", content: reply, links }]);
      setIsTyping(false);
    }, 1200);
  };

  // Inquiry form submit
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiry.name.trim() || !inquiry.email.trim() || !inquiry.message.trim()) {
      toast({ type: "warning", message: "Please fill in all fields" });
      return;
    }
    setSubmittingInquiry(true);
    setTimeout(() => {
      toast({ type: "success", message: "Inquiry submitted! We will respond via email shortly." });
      setInquiry({ name: "", email: "", message: "" });
      setSubmittingInquiry(false);
    }, 1000);
  };

  // Simulated Recommendations data
  const REC_DATA = {
    noc: [
      { q: "Do I need a signature on my NOC?", a: "Yes, it must be signed by the Head of Department (HOD) or Placement Officer." },
      { q: "Where do I submit the NOC document?", a: "Upload the signed NOC as a PDF to the Rosetta submission panel under Phase 1." }
    ],
    mentorship: [
      { q: "How often should I meet my internship mentor?", a: "We recommend a weekly check-in, or bi-weekly at minimum." },
      { q: "What should I do if my mentor is unresponsive?", a: "Notify the program coordinators via the communication channel immediately." }
    ],
    dates: [
      { q: "Is the final presentation date flexible?", a: "No, dates are locked by the IIT Ropar internship committee. Check the timeline tab." },
      { q: "When will certificates be issued?", a: "Within 4 weeks after the submission of your final project report." }
    ]
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] flex flex-col">
      <Navbar />

      {/* ── Notice Board Banner (Very Top) ── */}
      {showNotice && announcements.length > 0 && (
        <div className="bg-[rgb(var(--color-primary))] text-white px-4 py-3 relative z-40 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-[rgb(var(--color-accent))] shrink-0 animate-bounce" />
              <div className="text-xs sm:text-sm font-medium">
                <span className="font-bold font-display uppercase mr-2 tracking-wider bg-black/20 px-2 py-0.5 rounded-full text-[10px]">Announcement:</span>
                {announcements[0].title} — <span className="opacity-90">{announcements[0].content}</span>
              </div>
            </div>
            <button onClick={() => setShowNotice(false)} className="text-white hover:text-cyan-200 transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="relative bg-[rgb(var(--bg-surface))] py-20 border-b border-[rgb(var(--border-default))]">
        {/* Background blobs wrapper with overflow-hidden to prevent layout leakage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[rgba(0,131,143,0.1)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[rgba(0,176,255,0.08)] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-[rgb(var(--text-primary))] mb-4 leading-tight font-display">
            Vicharanashala FAQ Directory
          </h1>
          <p className="text-base text-[rgb(var(--text-secondary))] mb-8 max-w-2xl mx-auto">
            IIT Ropar Internship support desk. Search verified FAQs, engage in student discussion forums, or connect with admins.
          </p>

          {/* Centered Search Wrapper */}
          <div ref={searchRef} className="relative max-w-2xl mx-auto z-30">
            <form onSubmit={handleSearch} className="relative flex items-center shadow-lg rounded-2xl overflow-hidden bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] hover:border-[rgb(var(--color-primary-hover))] transition-all">
              <span className="absolute left-4 text-[rgb(var(--text-tertiary))]">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search internship rules, timing, certificate, NOC..."
                className="w-full pl-12 pr-24 py-4 text-sm bg-transparent border-none outline-none text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))]"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display hover:bg-[rgb(var(--color-primary-hover))] transition-all shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Autocomplete Predictions Card */}
            {showResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] rounded-2xl shadow-xl overflow-hidden text-left z-50 animate-scale-in">
                <div className="p-3 border-b border-[rgb(var(--border-default))] bg-[rgb(var(--bg-base))] flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[rgb(var(--text-secondary))] uppercase tracking-wider">Matching Queries</span>
                  <span className="text-[10px] text-[rgb(var(--text-tertiary))]">Press Enter to view all</span>
                </div>
                {searchResults.length === 0 ? (
                  <p className="p-4 text-xs text-[rgb(var(--text-tertiary))] text-center">No matching FAQs found</p>
                ) : (
                  <div className="divide-y divide-[rgb(var(--border-default))] max-h-60 overflow-y-auto">
                    {searchResults.map((f) => (
                      <button
                        key={f._id}
                        onClick={() => navigate(`/faqs/${encodeURIComponent(f.category)}?highlight=${f._id}`)}
                        className="w-full text-left p-3 hover:bg-[rgb(var(--bg-hover))] transition-colors flex items-start gap-2 text-xs"
                      >
                        <HelpCircle size={14} className="text-[rgb(var(--color-primary))] mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{f.question}</p>
                          <p className="text-[10px] text-[rgb(var(--text-tertiary))] mt-0.5">{f.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Dynamic Feed Grid (3 Column Lists) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Trending FAQs */}
        <div className="bg-[rgb(var(--bg-surface))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-[rgb(var(--border-default))] pb-2 shrink-0">
            <TrendingUp size={16} className="text-[rgb(var(--color-primary))]" />
            <h3 className="font-bold font-display text-sm text-[rgb(var(--text-primary))]">Trending FAQs</h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {trendingFaqs.map((f, idx) => (
              <button
                key={f._id}
                onClick={() => navigate(`/faqs/${encodeURIComponent(f.category)}?highlight=${f._id}`)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-[rgb(var(--bg-hover))] transition-all flex items-start gap-2.5"
              >
                <span className="text-xs font-bold text-[rgb(var(--color-primary))] mt-0.5">0{idx + 1}</span>
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{f.question}</p>
                  <span className="text-[10px] text-[rgb(var(--text-tertiary))]">▲ {f.upvotes || 0} votes</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Most Searched */}
        <div className="bg-[rgb(var(--bg-surface))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-[rgb(var(--border-default))] pb-2 shrink-0">
            <Search size={16} className="text-cyan-600" />
            <h3 className="font-bold font-display text-sm text-[rgb(var(--text-primary))]">Most Searched</h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {mostSearched.map((f) => (
              <button
                key={f._id}
                onClick={() => navigate(`/faqs/${encodeURIComponent(f.category)}?highlight=${f._id}`)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-[rgb(var(--bg-hover))] transition-all flex items-start gap-2.5"
              >
                <HelpCircle size={14} className="text-cyan-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{f.question}</p>
                  <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{f.views || 0} views</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Recently Answered */}
        <div className="bg-[rgb(var(--bg-surface))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-[rgb(var(--border-default))] pb-2 shrink-0">
            <Megaphone size={16} className="text-teal-600" />
            <h3 className="font-bold font-display text-sm text-[rgb(var(--text-primary))]">Recently Answered</h3>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {recentlyAnswered.map((f) => (
              <button
                key={f._id}
                onClick={() => navigate(`/faqs/${encodeURIComponent(f.category)}?highlight=${f._id}`)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-[rgb(var(--bg-hover))] transition-all flex items-start gap-2.5"
              >
                <BookOpen size={14} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[rgb(var(--text-primary))] line-clamp-1">{f.question}</p>
                  <span className="text-[10px] text-[rgb(var(--text-tertiary))]">
                    {new Date(f.createdAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Smart AI Recommendation Panel ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold font-display text-[rgb(var(--text-primary))] mb-1">Smart AI Recommendations</h3>
          <p className="text-xs text-[rgb(var(--text-secondary))] mb-4">Personalized recommendations simulated from search history.</p>

          <div className="flex gap-2 border-b border-[rgb(var(--border-default))] pb-2 mb-4">
            <button
              onClick={() => setActiveRecTab("noc")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                activeRecTab === "noc" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
              }`}
            >
              NOC & Submission
            </button>
            <button
              onClick={() => setActiveRecTab("mentorship")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                activeRecTab === "mentorship" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
              }`}
            >
              Work & Mentorship
            </button>
            <button
              onClick={() => setActiveRecTab("dates")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                activeRecTab === "dates" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
              }`}
            >
              Dates & Schedule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REC_DATA[activeRecTab].map((item, idx) => (
              <div key={idx} className="p-3 bg-[rgb(var(--bg-base))] rounded-xl border border-[rgb(var(--border-default))]">
                <p className="text-xs font-bold text-[rgb(var(--text-primary))] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--color-primary))]" />
                  {item.q}
                </p>
                <p className="text-xs text-[rgb(var(--text-secondary))] mt-1.5 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse Categories Treemap ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold font-display text-[rgb(var(--text-primary))]">Browse Categories</h2>
            <p className="text-sm text-[rgb(var(--text-tertiary))] mt-0.5">
              Rectangle size reflects how many FAQs each category has
            </p>
          </div>
          <span className="text-[10px] text-[rgb(var(--text-tertiary))] bg-[rgb(var(--bg-hover))] px-2 py-1 rounded-full">
            {Object.values(categoryFaqs).flat().length} total FAQs
          </span>
        </div>

        {/* Treemap flex-wrap grid */}
        <div className="flex flex-wrap gap-3 items-start">
          {categories.map((cat) => {
            const faqsInCat = categoryFaqs[cat.name] || [];
            const count = faqsInCat.length;
            return (
              <CategoryCard
                key={cat.name}
                cat={cat}
                count={count}
                onClick={() => navigate(`/faqs/${encodeURIComponent(cat.name)}`)}
              />
            );
          })}
        </div>
      </section>

      {/* ── Statistics Section ── */}
      <section className="bg-[rgb(var(--bg-surface))] border-y border-[rgb(var(--border-default))] py-12 my-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-black text-[rgb(var(--color-primary))] font-display">120+</p>
              <p className="text-xs text-[rgb(var(--text-secondary))] font-semibold mt-1">Verified FAQs</p>
            </div>
            <div>
              <p className="text-3xl font-black text-cyan-600 font-display">{categories.length}</p>
              <p className="text-xs text-[rgb(var(--text-secondary))] font-semibold mt-1">Predefined Modules</p>
            </div>
            <div>
              <p className="text-3xl font-black text-teal-600 font-display">500+</p>
              <p className="text-xs text-[rgb(var(--text-secondary))] font-semibold mt-1">Discussion Posts</p>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-600 font-display">100%</p>
              <p className="text-xs text-[rgb(var(--text-secondary))] font-semibold mt-1">Admin Vetted</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer & Contact Form ── */}
      <footer className="bg-[rgb(var(--bg-surface))] border-t border-[rgb(var(--border-default))] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Copyright/Info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-hover))] flex items-center justify-center text-white font-black text-sm">
                  🏢
                </div>
                <span className="text-base font-bold font-display text-[rgb(var(--text-primary))]">Vicharanashala HelpDesk</span>
              </div>
              <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed max-w-sm">
                A unified support desk system mapping standard internship FAQs for IIT Ropar interns. Connect with peers, search documentation, and log queries effortlessly.
              </p>
            </div>
            <p className="text-xs text-[rgb(var(--text-tertiary))] mt-8">
              © 2026 Vicharanashala IIT Ropar. All rights reserved.
            </p>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-[rgb(var(--bg-base))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm">
            <h4 className="text-sm font-bold font-display text-[rgb(var(--text-primary))] mb-1">Support Inquiry Form</h4>
            <p className="text-[11px] text-[rgb(var(--text-secondary))] mb-4">Submit a private support question directly to the admins.</p>
            <form onSubmit={handleInquirySubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={inquiry.name}
                  onChange={(e) => setInquiry((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-base text-xs py-2 px-3"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={inquiry.email}
                  onChange={(e) => setInquiry((prev) => ({ ...prev, email: e.target.value }))}
                  className="input-base text-xs py-2 px-3"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Write your support question..."
                value={inquiry.message}
                onChange={(e) => setInquiry((prev) => ({ ...prev, message: e.target.value }))}
                className="input-base text-xs py-2 px-3 resize-none"
              />
              <button
                type="submit"
                disabled={submittingInquiry}
                className="w-full py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {submittingInquiry ? "Submitting..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </footer>

      {/* ── Floating AI Support Chatbot Bubble & Drawer ── */}
      <div className="fixed bottom-5 right-5 z-50">
        {/* Bubble */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="w-12 h-12 rounded-full bg-[rgb(var(--color-primary))] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all focus:outline-none"
          title="AI Assistant Chatbot"
        >
          {chatOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>

        {/* Drawer */}
        {chatOpen && (
          <div className="absolute bottom-14 right-0 w-80 sm:w-96 h-96 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-4 bg-[rgb(var(--color-primary))] text-white flex items-center gap-2">
              <span className="text-base">🤖</span>
              <div>
                <h4 className="text-xs font-bold font-display">IIT Ropar AI Assistant</h4>
                <p className="text-[10px] text-cyan-200">Online · Ask me anything</p>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[rgb(var(--bg-base))]">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.role === "user" ? "bg-[rgb(var(--color-primary))] text-white" : "bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] text-[rgb(var(--text-primary))]"
                  }`}>
                    {msg.content}
                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-[rgb(var(--border-default))] pt-1.5">
                        {msg.links.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            to={link.path}
                            className="block text-[10px] text-cyan-600 font-semibold hover:underline"
                          >
                            🔗 {link.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-1 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] p-2 px-3 rounded-2xl w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>

            {/* Input area */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-[rgb(var(--border-strong))] bg-[rgb(var(--bg-surface))] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something (e.g. NOC signed...)"
                className="flex-1 px-3 py-1.5 text-xs bg-[rgb(var(--bg-base))] border border-[rgb(var(--border-default))] rounded-xl outline-none focus:border-[rgb(var(--color-primary))] text-[rgb(var(--text-primary))]"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-[rgb(var(--color-primary))] text-white flex items-center justify-center hover:bg-[rgb(var(--color-primary-hover))] transition-colors shrink-0"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}