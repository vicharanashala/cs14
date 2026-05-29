import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DiscussionPage from "./pages/DiscussionPage";
import AdminPage from "./pages/AdminPage";
import FaqPage from "./pages/FaqPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/faqs/:category" element={<FaqPage />} />
        <Route path="/discussions" element={<DiscussionPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}