import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronDown, X, Filter, ArrowUpDown } from "lucide-react";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";

const CATEGORIES = [
  "All", "About the Internship", "Timing and Dates", "NOC",
  "Selection and Offer Letter", "Work and Mentorship", "Communication Channels",
  "Interviews", "Certificate", "Rosetta", "Phase 1 and Coursework",
  "Yaksha Chat", "ViBe Platform", "Team Formation",
];

const SORT_OPTIONS = [
  { value: "views", label: "Most Viewed" },
  { value: "recent", label: "Most Recent" },
  { value: "upvotes", label: "Most Upvoted" },
  { value: "unanswered", label: "Unanswered First" },
];

function FaqRow({ faq, highlight }) {
  const isHighlighted = highlight === faq._id;
  return (
    <div
      id={`faq-${faq._id}`}
      className={`bg-[rgb(var(--bg-surface))] border rounded-xl p-4 transition-all card-hover ${
        isHighlighted
          ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900/50"
          : "border-[rgb(var(--border-default))] hover:border-indigo-200 dark:hover:border-indigo-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
              {faq.category || "General"}
            </span>
            <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{faq.views || 0} views</span>
            <span className="text-[10px] text-[rgb(var(--text-tertiary))]">·</span>
            <span className="text-[10px] text-[rgb(var(--text-tertiary))]">{faq.upvotes || 0} upvotes</span>
          </div>
          <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] leading-snug mb-1.5">
            {faq.question}
          </h3>
          {faq.answer && (
            <p className="text-xs text-[rgb(var(--text-secondary))] line-clamp-2 leading-relaxed">
              {faq.answer.replace(/<[^>]+>/g, "").substring(0, 200)}
              {faq.answer.length > 200 ? "…" : ""}
            </p>
          )}
        </div>
        <Link
          to={`/faqs/${encodeURIComponent(faq.category || "General")}?highlight=${faq._id}`}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[rgb(var(--bg-hover))] text-[rgb(var(--text-secondary))] hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 transition-colors border border-[rgb(var(--border-default))]"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default function AllFaqsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialSort = searchParams.get("sort") || "views";
  const highlightId = searchParams.get("highlight") || null;

  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get("/faqs?limit=500").then((r) => {
      setAllFaqs(Array.isArray(r) ? r : (r?.data || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Sync URL params → state
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setInputValue(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "All");
    setSortBy(searchParams.get("sort") || "views");
  }, [searchParams]);

  const applyFilters = (q, cat, sort) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat && cat !== "All") params.set("category", cat);
    if (sort && sort !== "views") params.set("sort", sort);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
    applyFilters(inputValue, selectedCategory, sortBy);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    applyFilters(searchQuery, cat, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    applyFilters(searchQuery, selectedCategory, sort);
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchQuery("");
    applyFilters("", selectedCategory, sortBy);
  };

  // Filter + sort
  let filtered = [...allFaqs];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }
  if (selectedCategory !== "All") {
    filtered = filtered.filter((f) => f.category === selectedCategory);
  }
  switch (sortBy) {
    case "recent":
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case "upvotes":
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      break;
    case "unanswered":
      filtered = filtered.filter((f) => !f.answer || f.answer.trim() === "");
      break;
    default:
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-[rgb(var(--text-primary))] mb-1">All FAQs</h1>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            Browse the complete knowledge base — {loading ? "…" : `${allFaqs.length} questions`}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="mb-5">
          <div className="flex items-center gap-2 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl overflow-hidden focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-colors">
            <Search size={16} className="ml-4 text-[rgb(var(--text-tertiary))] shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search all FAQs..."
              className="flex-1 px-3 py-3 bg-transparent text-sm text-[rgb(var(--text-primary))] placeholder-[rgb(var(--text-tertiary))] outline-none"
            />
            {inputValue && (
              <button type="button" onClick={clearSearch} className="p-2 hover:bg-[rgb(var(--bg-hover))] transition-colors">
                <X size={14} className="text-[rgb(var(--text-tertiary))]" />
              </button>
            )}
            <button
              type="submit"
              className="m-1 mr-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedCategory === cat
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-[rgb(var(--bg-surface))] border-[rgb(var(--border-default))] text-[rgb(var(--text-secondary))] hover:border-indigo-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[rgb(var(--border-default))] bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] hover:border-indigo-300 transition-colors"
            >
              <ArrowUpDown size={12} />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort"}
              <ChevronDown size={11} />
            </button>
            {showFilters && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                <div className="absolute right-0 top-full mt-1.5 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl shadow-xl overflow-hidden z-20 min-w-[160px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { handleSortChange(opt.value); setShowFilters(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                        sortBy === opt.value
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold"
                          : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active filter tags */}
        {(searchQuery || selectedCategory !== "All") && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-[11px] text-[rgb(var(--text-tertiary))]">Active filters:</span>
            {searchQuery && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                "{searchQuery}"
                <button onClick={clearSearch}><X size={9} /></button>
              </span>
            )}
            {selectedCategory !== "All" && (
              <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                {selectedCategory}
                <button onClick={() => handleCategoryChange("All")}><X size={9} /></button>
              </span>
            )}
            <button
              onClick={() => { clearSearch(); handleCategoryChange("All"); }}
              className="text-[11px] text-[rgb(var(--text-tertiary))] hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--bg-hover))] flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-[rgb(var(--text-tertiary))]" />
            </div>
            <h3 className="text-base font-bold text-[rgb(var(--text-primary))] mb-1">No FAQs found</h3>
            <p className="text-xs text-[rgb(var(--text-secondary))] mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { clearSearch(); handleCategoryChange("All"); }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq) => (
              <FaqRow key={faq._id} faq={faq} highlight={highlightId} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}