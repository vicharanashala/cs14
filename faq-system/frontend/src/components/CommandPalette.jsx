import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SUGGESTIONS = [
  { group: "Navigation", items: [
    { icon: "🏠", label: "Go to Home", sub: "Landing page", path: "/" },
    { icon: "💬", label: "Discussions", sub: "Community forum", path: "/discussions" },
    { icon: "📋", label: "Browse FAQs", sub: "View all categories", path: "/faqs/About the Internship" },
  ]},
  { group: "Categories", items: [
    { icon: "🏢", label: "About the Internship", sub: "12 FAQs", path: "/faqs/About the Internship" },
    { icon: "📅", label: "Timing and Dates", sub: "5 FAQs", path: "/faqs/Timing and Dates" },
    { icon: "📄", label: "NOC", sub: "13 FAQs", path: "/faqs/NOC" },
    { icon: "🎓", label: "Selection and Offer Letter", sub: "26 FAQs", path: "/faqs/Selection and Offer Letter" },
    { icon: "💼", label: "Work and Mentorship", sub: "4 FAQs", path: "/faqs/Work and Mentorship" },
    { icon: "💻", label: "ViBe Platform", sub: "21 FAQs", path: "/faqs/ViBe Platform" },
    { icon: "🏗️", label: "Team Formation", sub: "17 FAQs", path: "/faqs/Team Formation" },
  ]},
];

export default function CommandPalette({ onClose }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = SUGGESTIONS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.sub.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  const flat = filtered.flatMap((g) => g.items);

  useEffect(() => { setSelected(0); }, [query]);

  const handleKey = useCallback((e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && flat[selected]) {
      navigate(flat[selected].path);
      onClose();
    }
    else if (e.key === "Escape") onClose();
  }, [flat, selected, navigate, onClose]);

  return (
    <div className="command-overlay animate-fade-in" onMouseDown={onClose}>
      <div
        className="w-full max-w-xl bg-[rgb(var(--bg-surface))] rounded-xl shadow-2xl border border-[rgb(var(--border-default))] overflow-hidden animate-scale-in"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgb(var(--border-default))]">
          <span className="text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages, categories, actions..."
            className="flex-1 bg-transparent text-sm outline-none text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))]"
          />
          <span className="kbd">ESC</span>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {flat.length === 0 ? (
            <p className="text-center text-sm text-[rgb(var(--text-tertiary))] py-8">No results found</p>
          ) : (
            filtered.map((group) => (
              <div key={group.group}>
                <p className="px-4 py-1.5 text-xs font-semibold text-[rgb(var(--text-tertiary))] uppercase tracking-wider">
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const idx = flat.indexOf(item);
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); onClose(); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        selected === idx
                          ? "bg-[rgb(var(--bg-active))]"
                          : "hover:bg-[rgb(var(--bg-hover))]"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.label}</p>
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">{item.sub}</p>
                      </div>
                      {selected === idx && <span className="ml-auto kbd">↵</span>}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-[rgb(var(--border-default))]">
          <span className="flex items-center gap-1 text-xs text-[rgb(var(--text-tertiary))]">
            <span className="kbd">↑↓</span> navigate
          </span>
          <span className="flex items-center gap-1 text-xs text-[rgb(var(--text-tertiary))]">
            <span className="kbd">↵</span> select
          </span>
          <span className="flex items-center gap-1 text-xs text-[rgb(var(--text-tertiary))]">
            <span className="kbd">ESC</span> close
          </span>
        </div>
      </div>
    </div>
  );
}