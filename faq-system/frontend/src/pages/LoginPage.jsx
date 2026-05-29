import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    api.post("/auth/login", form)
      .then((res) => {
        login(res.data.user, res.data.token);
        navigate(res.data.user.role === "admin" ? "/admin" : "/");
      })
      .catch((err) => setError(err.response?.data?.message || "Login failed. Check your credentials."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30" />

      <div className="w-full max-w-sm animate-popIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center text-2xl shadow-lg shadow-indigo-500/30 mb-3">
            📚
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            FAQ<span className="gradient-text">system</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <form onSubmit={handleSubmit} className="p-7 space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold">
                <span>⚠️</span>{error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📧</span>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                <input type={showPw ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-400 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 btn-primary text-sm flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign in →"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Create one — it's free
          </Link>
        </p>
      </div>
    </div>
  );
}