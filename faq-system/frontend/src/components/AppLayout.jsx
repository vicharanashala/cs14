import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ToastContainer from "./Toast";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))]">
      {/* Fixed top navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Layout body */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main
          className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
          style={{ transition: "margin-left 0.3s" }}
        >
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}