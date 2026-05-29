import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { to: "/", icon: "🏠", label: "Home" },
  { to: "/discussions", icon: "💬", label: "Discussions" },
];

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
    setProfileOpen(false);
  }

  const avatarColor = isAdmin
    ? "bg-gradient-to-br from-amber-400 to-orange-500"
    : "bg-gradient-to-br from-indigo-500 to-purple-500";

  return (
    <>
      {/* ── Sticky Top Navbar ── */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
            : "bg-white border-b border-slate-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm shadow-sm">
              📚
            </div>
            <span className="text-base font-extrabold text-slate-900 hidden sm:block">
              FAQ<span className="gradient-text">system</span>
            </span>
          </Link>

          {/* Center Nav — desktop */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-2xl p-1">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                  }`
                }
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                  }`
                }
              >
                <span className="text-base">⚙️</span>
                <span>Admin</span>
              </NavLink>
            )}
          </div>

          {/* Right — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Post button */}
                <Link
                  to="/discussions"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  ✍️ Ask Question
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-1 py-1 rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    <div className={`w-8 h-8 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xs font-extrabold shadow-sm`}>
                      {currentUser.username[0].toUpperCase()}
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <>
                      <div className="overlay" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-slideDown">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="text-sm font-bold text-slate-900">{currentUser.username}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                              🛡️ Admin
                            </span>
                          )}
                        </div>
                        <div className="py-1.5">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Join now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <Link to="/discussions" className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm shadow-sm">
                ✍️
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-600 transition-all"
            >
              <span className="text-lg">{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-4 space-y-1 animate-slideDown">
            <NavLink to="/" end onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-600">
              🏠 Home
            </NavLink>
            <NavLink to="/discussions" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
              💬 Discussions
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                ⚙️ Admin Panel
              </NavLink>
            )}
            {!currentUser && (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center btn-primary text-sm">
                  Join now
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── Bottom Navigation (mobile only) ── */}
      {currentUser && (
        <nav className="bottom-nav md:hidden">
          {[
            { to: "/", icon: "🏠", label: "Home" },
            { to: "/discussions", icon: "💬", label: "Discuss" },
            ...(isAdmin ? [{ to: "/admin", icon: "⚙️", label: "Admin" }] : []),
          ].map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`
              }
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </>
  );
}