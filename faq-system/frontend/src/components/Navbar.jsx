import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import CommandPalette from "./CommandPalette";
import { toast } from "./Toast";
import UserBadgeChip from "./UserBadgeChip";
import api from "../api/axios";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/discussions", label: "Discussions", icon: "message-circle" },
  { to: "/badges", label: "Badges", icon: "award" },
];

const ICONS = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  "message-circle": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  "search": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  "moon": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  "sun": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  "log-out": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  "award": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  "user": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  "layout-dashboard": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  "zap": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
};

export default function Navbar() {
  const { currentUser, isAdmin, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showPalette, setShowPalette] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); setUserMenuOpen(false); };

  return (
    <>
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} />}

      <header className="sticky top-0 z-50 h-16 bg-[rgb(var(--bg-surface))] border-b border-[rgb(var(--border-default))] flex items-center px-5 gap-4"
        style={{ backdropFilter: "blur(12px)" }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md">
            FAQ
          </div>
          <span className="font-bold text-[rgb(var(--text-primary))] tracking-tight hidden sm:block">
            HelpDesk
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-item text-sm ${isActive ? "active" : ""}`
              }
            >
              {ICONS[item.icon]}
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item text-sm ${isActive ? "active" : ""}`}>
              {ICONS["layout-dashboard"]}
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Search trigger */}
          <button
            onClick={() => setShowPalette(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgb(var(--bg-hover))] border border-[rgb(var(--border-default))] text-sm text-[rgb(var(--text-tertiary))] hover:border-[rgb(var(--border-strong))] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="hidden sm:inline">Search...</span>
            <span className="kbd hidden sm:inline">⌘K</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? ICONS.moon : ICONS.sun}
          </button>

          {/* User menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[rgb(var(--bg-hover))] border border-[rgb(var(--border-default))] hover:border-[rgb(var(--border-strong))] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {(currentUser.username || currentUser.email || "User")[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[rgb(var(--text-primary))] hidden sm:block">
                  {currentUser.username || currentUser.email || "User"}
                </span>
                <UserBadgeChip
                  userId={currentUser.userId || currentUser._id}
                  className="hidden sm:flex"
                />
                {isAdmin && (
                  <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                    Admin
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-[rgb(var(--border-default))]">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{currentUser.username || currentUser.email || "User"}</p>
                        <UserBadgeChip userId={currentUser.userId || currentUser._id} />
                      </div>
                      <p className="text-xs text-[rgb(var(--text-tertiary))]">{currentUser.email || "Signed in"}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors">
                        {ICONS["layout-dashboard"]} Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      {ICONS["log-out"]} Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] transition-colors">
                Sign in
              </Link>
              <Link to="/register"
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-hover))] transition-colors shadow-sm">
                Get started
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}