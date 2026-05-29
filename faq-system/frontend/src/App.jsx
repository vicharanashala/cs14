import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AllFaqsPage from "./pages/AllFaqsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DiscussionPage from "./pages/DiscussionPage";
import AdminPage from "./pages/AdminPage";
import FaqPage from "./pages/FaqPage";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Auth pages — no navbar/sidebar */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

        {/* Home — full landing page (no sidebar) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/all-faqs" element={<AllFaqsPage />} />

        {/* Main app pages — with sidebar + topbar */}
        <Route path="/faqs/:category" element={<AppLayout><FaqPage /></AppLayout>} />
        <Route path="/discussions" element={<AppLayout><DiscussionPage /></AppLayout>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AppLayout><AdminPage /></AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}