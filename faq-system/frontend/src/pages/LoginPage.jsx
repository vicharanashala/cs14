import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError("Please fill in all fields"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token);
      navigate(res.data.user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const { login } = {};

  return (
    <div className="w-full">
      {/* Card */}
      <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl shadow-xl overflow-hidden">
        {/* Gradient header strip */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="px-8 py-8">
          {/* Logo + title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg mb-4">
              FAQ
            </div>
            <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Welcome back</h1>
            <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">Sign in to your HelpDesk account</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] text-sm">👤</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="input-base pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] text-sm">🔒</span>
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-base pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] text-sm transition-colors"
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-[rgb(var(--text-tertiary))] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-[rgb(var(--color-primary))] hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Back to home */}
      <div className="text-center mt-6">
        <Link to="/" className="text-xs text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] transition-colors flex items-center justify-center gap-1">
          ← Back to HelpDesk
        </Link>
      </div>
    </div>
  );
}