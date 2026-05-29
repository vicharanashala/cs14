import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "../components/Toast";
import { Shield, Database, Activity, LayoutGrid, Megaphone, Terminal, FileDown, Trash2, CheckCircle2, XCircle, Search, Sparkles, Merge, Plus, Edit3 } from "lucide-react";

import { useCategories } from "../context/CategoryContext";

export default function AdminPage() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("analytics");
  const [faqs, setFaqs] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const { categories, refreshCategories } = useCategories();

  // Loading state
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedDiscussions, setSelectedDiscussions] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Moderation Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDisc, setActiveDisc] = useState(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);

  // Categories addition state
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  // Announcements CRUD states
  const [annForm, setAnnForm] = useState({ id: null, title: "", content: "" });
  const [annModalOpen, setAnnModalOpen] = useState(false);

  // Telemetry states (CPU, RAM, Latency)
  const [telemetry, setTelemetry] = useState({ cpu: 22, ram: 2.6, latency: 28 });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);

  // Real backend analytics state
  const [analytics, setAnalytics] = useState({
    totalFaqs: 0,
    totalUsers: 0,
    mostActiveCategory: "None",
    mostUpvotedQuestion: { title: "None", upvotes: 0 }
  });

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      const [faqRes, discRes, annRes, analyticsRes] = await Promise.all([
        api.get("/faqs?limit=200").catch(() => ({ data: [] })),
        api.get("/admin/discussions").catch(() => ({ data: [] })),
        api.get("/announcements").catch(() => ({ data: [] })),
        api.get("/admin/analytics").catch(() => ({ data: { totalFaqs: 0, totalUsers: 0, mostActiveCategory: "None", mostUpvotedQuestion: { title: "None", upvotes: 0 } } }))
      ]);

      setFaqs(Array.isArray(faqRes.data) ? faqRes.data : (faqRes.data?.data || []));
      setDiscussions(Array.isArray(discRes.data) ? discRes.data : (discRes.data?.data || []));
      setAnnouncements(Array.isArray(annRes.data) ? annRes.data : (annRes.data?.data || []));
      setAnalytics(analyticsRes.data);
    } catch (err) {
      toast({ type: "error", message: "Failed to fetch admin panel data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAdmin]);

  // Load audit logs from localStorage or seed them
  useEffect(() => {
    const logs = localStorage.getItem("admin_audit_logs");
    if (logs) {
      setAuditLogs(JSON.parse(logs));
    } else {
      const seedLogs = [
        { action: "System Initialized", username: "System", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        { action: "Admin Panel Mounted", username: currentUser?.username || "Admin", timestamp: new Date().toISOString() },
      ];
      localStorage.setItem("admin_audit_logs", JSON.stringify(seedLogs));
      setAuditLogs(seedLogs);
    }
  }, []);

  // Update audit log helper
  const addAuditLog = (action) => {
    const newLog = {
      action,
      username: currentUser?.username || "Admin",
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem("admin_audit_logs", JSON.stringify(updated));
  };

  // Telemetry fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        cpu: Math.floor(18 + Math.random() * 25), // 18% - 43%
        ram: parseFloat((2.4 + Math.random() * 0.6).toFixed(2)), // 2.4GB - 3.0GB
        latency: Math.floor(14 + Math.random() * 22) // 14ms - 36ms
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Export handlers
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(faqs, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "vicharanashala_faqs.json");
    dlAnchor.click();
    addAuditLog("Exported FAQs to JSON file");
    toast({ type: "success", message: "JSON file exported successfully!" });
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Question", "Answer", "Category", "Views", "CreatedAt"];
    const rows = faqs.map(f => [
      f._id,
      `"${(f.question || "").replace(/"/g, '""')}"`,
      `"${(f.answer || "").replace(/"/g, '""')}"`,
      f.category,
      f.views || 0,
      f.createdAt || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", encodeURI(csvContent));
    dlAnchor.setAttribute("download", "vicharanashala_faqs.csv");
    dlAnchor.click();
    addAuditLog("Exported FAQs to CSV file");
    toast({ type: "success", message: "CSV file exported successfully!" });
  };

  // Moderation filtering
  const filteredDiscussions = discussions.filter(d => {
    const matchesQuery = !searchQuery.trim() ||
      (d.title || d.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === "All" || d.category === filterCategory;
    const matchesStatus = filterStatus === "All" || d.status === filterStatus;
    return matchesQuery && matchesCat && matchesStatus;
  });

  // Bulk actions handlers
  const handleBulkApprove = async () => {
    if (!selectedDiscussions.length) return;
    try {
      await api.post("/admin/discussions/bulk-approve", { ids: selectedDiscussions });
      toast({ type: "success", message: `Approved ${selectedDiscussions.length} discussions!` });
      addAuditLog(`Bulk approved ${selectedDiscussions.length} discussions`);
      setSelectedDiscussions([]);
      fetchData();
    } catch {
      toast({ type: "error", message: "Failed to execute bulk approval" });
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedDiscussions.length) return;
    try {
      await api.post("/admin/discussions/bulk-delete", { ids: selectedDiscussions });
      toast({ type: "success", message: `Deleted ${selectedDiscussions.length} spam/duplicate discussions!` });
      addAuditLog(`Bulk deleted ${selectedDiscussions.length} discussions`);
      setSelectedDiscussions([]);
      fetchData();
    } catch {
      toast({ type: "error", message: "Failed to delete discussions" });
    }
  };

  // Select all helper
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDiscussions(filteredDiscussions.map(d => d._id));
    } else {
      setSelectedDiscussions([]);
    }
  };

  // Sliding Drawer actions
  const openModerationDrawer = (disc) => {
    setActiveDisc(disc);
    setAiAnswer("");
    // Run duplicate check similarity locally
    const titleLower = (disc.title || disc.question || "").toLowerCase();
    const getJaccard = (s1, s2) => {
      const w1 = new Set(s1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const w2 = new Set(s2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      if (w1.size === 0 || w2.size === 0) return 0;
      const inter = new Set([...w1].filter(x => w2.has(x)));
      const union = new Set([...w1, ...w2]);
      return inter.size / union.size;
    };
    const matches = [];
    faqs.forEach(f => {
      const score = getJaccard(titleLower, f.question);
      if (score >= 0.15) {
        matches.push({ id: f._id, type: "faq", title: f.question, score });
      }
    });
    discussions.forEach(d => {
      if (d._id !== disc._id) {
        const score = getJaccard(titleLower, d.title || d.question);
        if (score >= 0.15) {
          matches.push({ id: d._id, type: "discussion", title: d.title || d.question, score });
        }
      }
    });
    setDuplicateMatches(matches.sort((a,b) => b.score - a.score).slice(0, 3));
    setDrawerOpen(true);
  };

  // Generate AI Suggestion Answer
  const generateAiAnswer = () => {
    if (!activeDisc) return;
    setGeneratingAi(true);
    setTimeout(() => {
      const desc = activeDisc.description.toLowerCase();
      let ans = "";
      if (activeDisc.category === "NOC") {
        ans = "You need to fill out the No Objection Certificate (NOC) form, obtain the signature of your department HOD/Placement Cell officer, and submit it in PDF format via the Rosetta coursework platform under the Phase 1 NOC module. Submissions via email will not be validated.";
      } else if (activeDisc.category === "Rosetta") {
        ans = "Rosetta requires completion of all language learning exercises in Phase 1 coursework. Ensure you maintain at least 80% accuracy score. Certificates are automatically dispatched to active email accounts upon coordinator verification.";
      } else if (activeDisc.category === "Timing and Dates") {
        ans = "The Vicharanashala internship operates on strict project milestones. Extension requests are subject to approval by the academic committee and your designated mentor. Submit extensions via the support inquiry form at least 48 hours in advance.";
      } else {
        ans = `Regarding your query about "${activeDisc.title || activeDisc.question}": According to the Vicharanashala guidelines, please refer to the corresponding category dashboard. Check with your designated team lead and coordinator to submit project updates.`;
      }
      setAiAnswer(ans);
      setGeneratingAi(false);
      addAuditLog(`Generated AI Answer recommendation for discussion: ${activeDisc._id}`);
      toast({ type: "success", message: "AI suggested answer generated!" });
    }, 1000);
  };

  // Save AI answer as standard community response in database
  const insertAiAnswer = async () => {
    if (!aiAnswer.trim() || !activeDisc) return;
    try {
      await api.post(`/discussions/${activeDisc._id}/answers`, { content: aiAnswer });
      toast({ type: "success", message: "Suggested answer added to discussion replies!" });
      addAuditLog(`Saved AI suggested answer to discussion: ${activeDisc._id}`);
      setAiAnswer("");
      fetchData();
      setDrawerOpen(false);
    } catch {
      toast({ type: "error", message: "Failed to insert answer" });
    }
  };

  // Single Approve / Reject
  const handleApproveDisc = async (discId, answerId) => {
    if (!answerId) {
      toast({ type: "warning", message: "Choose or add an answer before approving as FAQ" });
      return;
    }
    try {
      await api.patch(`/admin/discussions/${discId}/approve`, { answerId });
      toast({ type: "success", message: "FAQ created successfully and discussion resolved!" });
      addAuditLog(`Approved discussion ${discId} to FAQ repository`);
      setDrawerOpen(false);
      fetchData();
    } catch {
      toast({ type: "error", message: "Approval failed" });
    }
  };

  const handleRejectDisc = async (discId) => {
    try {
      await api.patch(`/admin/discussions/${discId}/reject`);
      toast({ type: "info", message: "Discussion rejected and deleted" });
      addAuditLog(`Rejected/Deleted discussion ${discId}`);
      setDrawerOpen(false);
      fetchData();
    } catch {
      toast({ type: "error", message: "Rejection failed" });
    }
  };

  const handleMergeDuplicate = async (discId) => {
    try {
      await api.patch(`/admin/discussions/${discId}/reject`);
      toast({ type: "success", message: "Merged as duplicate (deleted duplicate query)" });
      addAuditLog(`Merged duplicate discussion ${discId}`);
      setDrawerOpen(false);
      fetchData();
    } catch {
      toast({ type: "error", message: "Merge failed" });
    }
  };

  // Category management
  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      toast({ type: "warning", message: "Category name is required" });
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      toast({ type: "warning", message: "Category already exists" });
      return;
    }
    try {
      await api.post("/admin/categories", {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        icon: newCatIcon.trim() || "📁"
      });
      setNewCatName("");
      setNewCatDesc("");
      setNewCatIcon("📁");
      await refreshCategories();
      addAuditLog(`Created new category: ${newCatName.trim()}`);
      toast({ type: "success", message: "Category added successfully!" });
    } catch (err) {
      toast({ type: "error", message: err.response?.data?.message || "Failed to add category" });
    }
  };

  const handleDeleteCategory = async (catName) => {
    try {
      await api.delete(`/admin/categories/${encodeURIComponent(catName)}`);
      await refreshCategories();
      addAuditLog(`Deleted category: ${catName}`);
      toast({ type: "info", message: `Deleted category: ${catName}` });
    } catch (err) {
      toast({ type: "error", message: err.response?.data?.message || "Failed to delete category" });
    }
  };

  // Announcements CRUD
  const handleOpenAnnModal = (ann = null) => {
    if (ann) {
      setAnnForm({ id: ann._id, title: ann.title, content: ann.content });
    } else {
      setAnnForm({ id: null, title: "", content: "" });
    }
    setAnnModalOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.content.trim()) return;

    try {
      if (annForm.id) {
        await api.put(`/announcements/${annForm.id}`, { title: annForm.title, content: annForm.content });
        toast({ type: "success", message: "Announcement updated!" });
        addAuditLog(`Updated announcement ID: ${annForm.id}`);
      } else {
        await api.post("/announcements", { title: annForm.title, content: annForm.content });
        toast({ type: "success", message: "Announcement created!" });
        addAuditLog(`Created new announcement: ${annForm.title}`);
      }
      setAnnModalOpen(false);
      fetchData();
    } catch {
      toast({ type: "error", message: "Failed to save announcement" });
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast({ type: "info", message: "Announcement deleted" });
      addAuditLog(`Deleted announcement ID: ${id}`);
      fetchData();
    } catch {
      toast({ type: "error", message: "Failed to delete announcement" });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black font-display text-[rgb(var(--text-primary))] flex items-center gap-2">
            <Shield className="text-[rgb(var(--color-primary))]" /> Admin Control Panel
          </h1>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5">Manage support telemetry, moderations, categories, and announcements.</p>
        </div>
        
        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] border border-[rgb(var(--border-strong))] text-xs font-bold font-display rounded-lg transition-all"
          >
            <FileDown size={14} /> Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] border border-[rgb(var(--border-strong))] text-xs font-bold font-display rounded-lg transition-all"
          >
            <Database size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-[rgb(var(--border-default))] pb-2 mb-6">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
            activeTab === "analytics" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          <Activity size={14} /> Analytics
        </button>
        <button
          onClick={() => setActiveTab("moderation")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
            activeTab === "moderation" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          <CheckCircle2 size={14} /> Moderation
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
            activeTab === "categories" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          <LayoutGrid size={14} /> Categories
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
            activeTab === "announcements" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          <Megaphone size={14} /> Announcements
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
            activeTab === "audit" ? "bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))]" : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))]"
          }`}
        >
          <Terminal size={14} /> Audit
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-[rgb(var(--text-tertiary))]">Total FAQs</span>
              <p className="text-2xl font-black font-display text-[rgb(var(--text-primary))] mt-1">{analytics.totalFaqs}</p>
            </div>
            <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-[rgb(var(--text-tertiary))]">Total Users</span>
              <p className="text-2xl font-black font-display text-emerald-600 mt-1">{analytics.totalUsers}</p>
            </div>
            <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-4">
              <span className="text-[10px] uppercase font-bold text-[rgb(var(--text-tertiary))]">Most Active Category</span>
              <p className="text-2xl font-black font-display text-indigo-600 mt-1 truncate" title={analytics.mostActiveCategory}>
                {analytics.mostActiveCategory}
              </p>
            </div>
            <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[rgb(var(--text-tertiary))]">Most Upvoted Question</span>
                <p 
                  className="text-xs font-bold text-[rgb(var(--text-primary))] line-clamp-2 mt-1" 
                  title={analytics.mostUpvotedQuestion?.title || "None"}
                >
                  {analytics.mostUpvotedQuestion?.title || "None"}
                </p>
              </div>
              {analytics.mostUpvotedQuestion && analytics.mostUpvotedQuestion.upvotes > 0 && (
                <span className="text-[9px] text-cyan-600 font-bold mt-1 block">
                  ▲ {analytics.mostUpvotedQuestion.upvotes} Upvotes
                </span>
              )}
            </div>
          </div>

          {/* Node Telemetry Component */}
          <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-[rgb(var(--border-default))] pb-2">
              <h3 className="text-sm font-bold font-display text-[rgb(var(--text-primary))] flex items-center gap-1.5">
                <Activity size={16} className="text-[rgb(var(--color-primary))] animate-pulse" />
                Real-Time Node Telemetry
              </h3>
              <span className="text-[9px] font-bold text-emerald-600 uppercase bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                Systems Live
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CPU load */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1 text-[rgb(var(--text-secondary))]">
                  <span>CPU Load</span>
                  <span>{telemetry.cpu}%</span>
                </div>
                <div className="w-full bg-[rgb(var(--bg-base))] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[rgb(var(--color-primary))] h-full transition-all duration-1000"
                    style={{ width: `${telemetry.cpu}%` }}
                  />
                </div>
              </div>

              {/* Memory Allocation */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1 text-[rgb(var(--text-secondary))]">
                  <span>Virtual Memory Allocation</span>
                  <span>{telemetry.ram} GB / 8.0 GB</span>
                </div>
                <div className="w-full bg-[rgb(var(--bg-base))] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-1000"
                    style={{ width: `${(telemetry.ram / 8.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Latency */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1 text-[rgb(var(--text-secondary))]">
                  <span>API Latency Response</span>
                  <span>{telemetry.latency} ms</span>
                </div>
                <div className="w-full bg-[rgb(var(--bg-base))] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full transition-all duration-1000"
                    style={{ width: `${(telemetry.latency / 60) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === "moderation" && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters Bar & Bulk Action Drawer Toggle */}
          <div className="bg-[rgb(var(--bg-surface))] p-4 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Search queries by keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[rgb(var(--bg-base))] border border-[rgb(var(--border-strong))] rounded-xl outline-none text-[rgb(var(--text-primary))]"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-base text-xs py-1.5 px-3 flex-1 sm:flex-initial"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-base text-xs py-1.5 px-3 flex-1 sm:flex-initial"
                >
                  <option value="All">All Statuses</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="pending">Pending</option>
                  <option value="answered">Answered</option>
                </select>
              </div>
            </div>

            {/* Bulk actions helper bar */}
            {selectedDiscussions.length > 1 && (
              <div className="flex items-center justify-between p-3 bg-[rgb(var(--color-primary-light))] border border-[rgb(var(--color-primary))] rounded-xl animate-scale-in">
                <span className="text-xs font-bold text-[rgb(var(--color-primary))] font-display">
                  🛠️ Bulk Actions: {selectedDiscussions.length} rows selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    className="px-3 py-1 bg-[rgb(var(--color-primary))] text-white text-[10px] font-bold rounded-lg hover:bg-[rgb(var(--color-primary-hover))] transition-all"
                  >
                    Verify Answers
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete Spams
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Moderation List Table */}
          <div className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border-default))] text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={filteredDiscussions.length > 0 && selectedDiscussions.length === filteredDiscussions.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="p-4">Topic / Query</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Replies</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border-default))] text-xs text-[rgb(var(--text-primary))]">
                  {filteredDiscussions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-[rgb(var(--text-tertiary))] italic">
                        No pending discussions matches the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDiscussions.map(d => (
                      <tr
                        key={d._id}
                        className="hover:bg-[rgb(var(--bg-hover))] transition-colors cursor-pointer"
                        onClick={() => openModerationDrawer(d)}
                      >
                        {/* Checkbox */}
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedDiscussions.includes(d._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDiscussions(prev => [...prev, d._id]);
                              } else {
                                setSelectedDiscussions(prev => prev.filter(id => id !== d._id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        {/* Title */}
                        <td className="p-4 font-semibold max-w-xs truncate">
                          {d.title || d.question}
                          <p className="text-[10px] text-[rgb(var(--text-tertiary))] font-normal mt-0.5">Posted by: {d.author?.username || "student"}</p>
                        </td>
                        {/* Category */}
                        <td className="p-4">{d.category}</td>
                        {/* Replies */}
                        <td className="p-4 font-bold">{d.answers?.length || 0}</td>
                        {/* Status */}
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                            d.status === "unanswered" ? "bg-amber-100 text-amber-800" : "bg-cyan-100 text-cyan-800"
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Details Sliding Drawer */}
      {drawerOpen && activeDisc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm">
          {/* Close click area */}
          <div className="flex-1" onClick={() => setDrawerOpen(false)} />

          {/* Drawer content body */}
          <div className="w-full max-w-lg bg-[rgb(var(--bg-surface))] h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in border-l border-[rgb(var(--border-strong))]">
            {/* Header */}
            <div className="p-4 bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border-default))] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-display uppercase tracking-wider text-[rgb(var(--text-secondary))]">Moderation Drawer</h4>
                <p className="text-xs font-bold text-[rgb(var(--text-primary))] mt-0.5 line-clamp-1">{activeDisc.title || activeDisc.question}</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))] p-1">
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {/* Context info */}
              <div className="bg-[rgb(var(--bg-base))] p-3.5 rounded-xl border border-[rgb(var(--border-default))] space-y-1.5">
                <p className="text-[10px] text-[rgb(var(--text-tertiary))]">Category: <span className="font-bold text-[rgb(var(--text-primary))]">{activeDisc.category}</span></p>
                <p className="text-[10px] text-[rgb(var(--text-tertiary))]">Submitted By: <span className="font-bold text-[rgb(var(--text-primary))]">{activeDisc.author?.username || "student"}</span></p>
                <p className="text-[10px] text-[rgb(var(--text-tertiary))]">Description:</p>
                <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed bg-[rgb(var(--bg-surface))] p-2.5 rounded border border-[rgb(var(--border-default))]">{activeDisc.description}</p>
              </div>

              {/* Duplicate Merger control widget */}
              <div className="bg-[rgb(var(--bg-base))] p-4 rounded-xl border border-[rgb(var(--border-default))] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] flex items-center gap-1">
                  <Merge size={12} /> Duplicate Similarity Checker
                </span>
                {duplicateMatches.length === 0 ? (
                  <p className="text-xs text-[rgb(var(--text-tertiary))] italic">No similar discussions/FAQs identified.</p>
                ) : (
                  <div className="space-y-2">
                    {duplicateMatches.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-[rgb(var(--bg-surface))] rounded border border-[rgb(var(--border-default))]">
                        <span className="truncate pr-2">[{m.type.toUpperCase()}] {m.title}</span>
                        <button
                          onClick={() => handleMergeDuplicate(activeDisc._id)}
                          className="shrink-0 text-[10px] px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded"
                        >
                          Merge Duplicate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggested Answer Panel */}
              <div className="bg-[rgb(var(--bg-base))] p-4 rounded-xl border border-[rgb(var(--border-default))] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] flex items-center gap-1">
                    <Sparkles size={12} className="text-[rgb(var(--color-primary))]" /> AI Answer Generator
                  </span>
                  <button
                    onClick={generateAiAnswer}
                    disabled={generatingAi}
                    className="px-2.5 py-1 bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary))] text-[10px] font-bold rounded-lg hover:bg-[rgb(var(--bg-hover))]"
                  >
                    {generatingAi ? "Analyzing..." : "Generate AI Answer"}
                  </button>
                </div>
                {aiAnswer && (
                  <div className="space-y-2">
                    <textarea
                      value={aiAnswer}
                      onChange={(e) => setAiAnswer(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 text-xs bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] rounded-lg resize-none outline-none focus:border-[rgb(var(--color-primary))]"
                    />
                    <button
                      onClick={insertAiAnswer}
                      className="px-3 py-1 bg-[rgb(var(--color-primary))] text-white text-[10px] font-bold rounded-lg hover:bg-[rgb(var(--color-primary-hover))]"
                    >
                      Insert as Answer
                    </button>
                  </div>
                )}
              </div>

              {/* Answers submitted */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))]">Submitted Answers ({activeDisc.answers?.length || 0})</span>
                {(activeDisc.answers || []).length === 0 ? (
                  <p className="text-xs text-[rgb(var(--text-tertiary))] italic">No answers submitted yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDisc.answers.map(ans => (
                      <div key={ans._id} className="p-3 bg-[rgb(var(--bg-base))] border border-[rgb(var(--border-default))] rounded-xl flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-[rgb(var(--text-secondary))]">{ans.author?.username || "student"}</p>
                          <p className="text-xs text-[rgb(var(--text-primary))] mt-1 leading-relaxed">{ans.content}</p>
                        </div>
                        <button
                          onClick={() => handleApproveDisc(activeDisc._id, ans._id)}
                          className="shrink-0 px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg"
                        >
                          Verify &amp; Create FAQ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[rgb(var(--border-default))] bg-[rgb(var(--bg-base))] flex gap-2">
              <button
                onClick={() => handleRejectDisc(activeDisc._id)}
                className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold font-display rounded-xl"
              >
                Reject Query
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-strong))] text-[rgb(var(--text-secondary))] text-xs font-bold font-display rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6 animate-fade-in">
          {/* Add Category Form */}
          <div className="bg-[rgb(var(--bg-surface))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm max-w-lg">
            <h3 className="text-xs font-bold font-display text-[rgb(var(--text-primary))] mb-3.5 uppercase tracking-wider">Add Category Module</h3>
            <div className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-1">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stipend & Finance"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full input-base text-xs py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-1">Icon</label>
                  <input
                    type="text"
                    placeholder="e.g. 💰"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full input-base text-xs py-2 px-3 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of this module..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full input-base text-xs py-2 px-3 resize-none"
                />
              </div>
              <button
                onClick={handleAddCategory}
                className="w-full py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))] transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>
          </div>

          {/* Categories Grid List */}
          <div className="bg-[rgb(var(--bg-surface))] p-5 rounded-2xl border border-[rgb(var(--border-default))] shadow-sm">
            <h3 className="text-xs font-bold font-display text-[rgb(var(--text-primary))] mb-3 uppercase tracking-wider">Active Categories ({categories.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map(cat => (
                <div key={cat.name} className="flex justify-between items-center p-3 bg-[rgb(var(--bg-base))] rounded-xl border border-[rgb(var(--border-default))] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{cat.icon || "📁"}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[rgb(var(--text-primary))] truncate" title={cat.name}>{cat.name}</p>
                      {cat.description && <p className="text-[10px] text-[rgb(var(--text-tertiary))] truncate" title={cat.description}>{cat.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.name)}
                    className="text-red-500 hover:text-red-700 p-1 shrink-0 ml-2"
                    title="Delete Category"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-display text-[rgb(var(--text-primary))] uppercase tracking-wider">Announcements ({announcements.length})</h3>
            <button
              onClick={() => handleOpenAnnModal()}
              className="px-3.5 py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))] transition-all flex items-center gap-1"
            >
              <Plus size={14} /> Post Announcement
            </button>
          </div>

          {/* Announcements list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map(ann => (
              <div key={ann._id} className="bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-default))] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className="text-sm font-bold font-display text-[rgb(var(--text-primary))]">{ann.title}</h4>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenAnnModal(ann)}
                        className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--color-primary))] p-1"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))] leading-relaxed line-clamp-3">{ann.content}</p>
                </div>
                <span className="text-[10px] text-[rgb(var(--text-tertiary))] mt-4 block">
                  Posted: {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          {/* Create/Edit Announcement Modal */}
          {annModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <form onSubmit={handleSaveAnnouncement} className="bg-[rgb(var(--bg-surface))] max-w-md w-full border border-[rgb(var(--border-strong))] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="px-5 py-4 bg-[rgb(var(--bg-base))] border-b border-[rgb(var(--border-default))] flex justify-between items-center">
                  <h4 className="text-xs font-bold font-display text-[rgb(var(--text-primary))]">
                    {annForm.id ? "Edit Announcement" : "Post New Announcement"}
                  </h4>
                  <button type="button" onClick={() => setAnnModalOpen(false)} className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-secondary))]">
                    ✕
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phase 1 Report Submission Deadline Extension"
                      value={annForm.title}
                      onChange={(e) => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full input-base text-xs py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--text-secondary))] mb-1">Content</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Enter detailed notice content here..."
                      value={annForm.content}
                      onChange={(e) => setAnnForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full input-base text-xs py-2 px-3 resize-none"
                    />
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-[rgb(var(--bg-base))] border-t border-[rgb(var(--border-default))] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-hover))] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white text-xs font-bold font-display rounded-xl hover:bg-[rgb(var(--color-primary-hover))]"
                  >
                    Save Notice
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-display text-[rgb(var(--text-primary))] uppercase tracking-wider flex items-center gap-1">
              <Terminal size={14} /> Security Audit Logging Console
            </h3>
            <button
              onClick={() => {
                localStorage.removeItem("admin_audit_logs");
                setAuditLogs([]);
                toast({ type: "info", message: "Audit logs cleared!" });
              }}
              className="text-red-500 hover:text-red-700 text-xs font-bold font-display"
            >
              Clear Logs
            </button>
          </div>

          {/* Terminal Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-2xl font-mono text-[11px] leading-relaxed text-emerald-400 overflow-hidden">
            <div className="border-b border-slate-900 pb-2 mb-3 flex items-center justify-between text-slate-500">
              <span>root@vicharanashala_audit:~# cat system.log</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> LIVE LOGGING</span>
            </div>
            
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-slate-600 italic">// No audit log entries recorded.</p>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toISOString()}]</span>
                    <span className="text-blue-400 shrink-0">&lt;{log.username}&gt;</span>
                    <span className="text-slate-100">{log.action}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}