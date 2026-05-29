import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-base shadow-sm">
                📚
              </div>
              <Link to="/" className="text-white font-bold text-lg hidden sm:block">FAQ System</Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
                  (isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5")
                }
              >
                🏠 Home
              </NavLink>
              <NavLink
                to="/discussions"
                className={({ isActive }) =>
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
                  (isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5")
                }
              >
                💬 Discussions
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 " +
                    (isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5")
                  }
                >
                  ⚙️ <span className="hidden lg:inline">Admin</span>
                </NavLink>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                      {currentUser.username[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium">{currentUser.username}</span>
                    {currentUser.role === "admin" && (
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-500/30"
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all ml-1"
              >
                <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-4 space-y-1 bg-slate-900">
            <NavLink to="/" end onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium bg-white/10">
              🏠 Home
            </NavLink>
            <NavLink to="/discussions" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
              💬 Discussions
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
                ⚙️ Admin Panel
              </NavLink>
            )}
            {!currentUser && (
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}