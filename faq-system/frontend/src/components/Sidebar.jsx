import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const SIDEBAR_NAV = [
  {
    group: "Main",
    items: [
      { to: "/", label: "Dashboard", icon: "home", end: true },
      { to: "/discussions", label: "Discussions", icon: "message-circle" },
    ],
  },
];

const CATEGORY_NAV = [
  { label: "About the Internship",    icon: "🏢", to: "/faqs/About the Internship" },
  { label: "Timing and Dates",        icon: "📅", to: "/faqs/Timing and Dates" },
  { label: "NOC",                     icon: "📄", to: "/faqs/NOC" },
  { label: "Selection and Offer",     icon: "🎓", to: "/faqs/Selection and Offer Letter" },
  { label: "Work & Mentorship",       icon: "💼", to: "/faqs/Work and Mentorship" },
  { label: "Communication",           icon: "📡", to: "/faqs/Communication Channels" },
  { label: "Interviews",              icon: "🎤", to: "/faqs/Interviews" },
  { label: "Certificate",             icon: "📜", to: "/faqs/Certificate" },
  { label: "Rosetta",                 icon: "🔤", to: "/faqs/Rosetta" },
  { label: "Phase 1 & Coursework",    icon: "📚", to: "/faqs/Phase 1 and Coursework" },
  { label: "Yaksha Chat",             icon: "💬", to: "/faqs/Yaksha Chat" },
  { label: "ViBe Platform",           icon: "💻", to: "/faqs/ViBe Platform" },
  { label: "Team Formation",          icon: "🏗️", to: "/faqs/Team Formation" },
];

const ICONS = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  "message-circle": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  "layout-dashboard": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
};

function CategoryIcon({ icon }) {
  return <span className="text-sm">{icon}</span>;
}

export default function Sidebar({ isOpen, onClose }) {
  const [catOpen, setCatOpen] = useState(true);
  const { isAdmin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active category from URL
  const isCategoryActive = (itemTo) => location.pathname === itemTo;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[rgb(var(--border-default))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md">
            FAQ
          </div>
          <div>
            <span className="font-bold text-[rgb(var(--text-primary))] text-base tracking-tight">HelpDesk</span>
            <p className="text-[10px] text-[rgb(var(--text-tertiary))] leading-tight">Internship FAQ System</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        {SIDEBAR_NAV.map((group) => (
          <div key={group.group} className="mb-4">
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
              {group.group}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `nav-item mb-0.5 ${isActive ? "active" : ""}`}
              >
                {ICONS[item.icon]}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        {/* Categories */}
        <div className="mb-4">
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 mb-1 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] transition-colors"
          >
            <span>Categories</span>
            <span className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          {catOpen && (
            <div className="space-y-0.5">
              {CATEGORY_NAV.map((item) => (
                <button
                  key={item.to}
                  onClick={() => { navigate(item.to); onClose(); }}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs mb-0.5 transition-colors ${
                    isCategoryActive(item.to)
                      ? "bg-indigo-100 dark:bg-indigo-900/smi text-indigo-600 dark:text-indigo-300 font-semibold"
                      : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] hover:text-[rgb(var(--text-primary))]"
                  }`}
                >
                  <CategoryIcon icon={item.icon} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin */}
        {isAdmin && (
          <div className="mb-4">
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-[rgb(var(--text-tertiary))]">
              Admin
            </p>
            <NavLink to="/admin" onClick={onClose}
              className={({ isActive }) => `nav-item mb-0.5 ${isActive ? "active" : ""}`}>
              {ICONS["layout-dashboard"]}
              Admin Panel
            </NavLink>
          </div>
        )}
      </div>

      {/* Theme indicator */}
      <div className="px-3 py-3 border-t border-[rgb(var(--border-default))]">
        <p className="text-xs px-3 py-2 text-[rgb(var(--text-tertiary))]">
          {theme === "light" ? "☀️ Light mode" : "🌙 Dark mode"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-30
          h-screen md:h-[calc(100vh-0px)]
          w-64 md:w-[260px]
          bg-[rgb(var(--bg-sidebar))] border-r border-[rgb(var(--border-default))]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col shrink-0
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
