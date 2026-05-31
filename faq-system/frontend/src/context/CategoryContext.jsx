import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

const CategoryContext = createContext();

const DEFAULT_ICONS = {
  "Timing and Dates": "📅",
  "NOC": "📝",
  "Selection and Offer Letter": "✉️",
  "Work and Mentorship": "💻",
  "Communication Channels": "💬",
  "Interviews": "🗣️",
  "Certificate": "📜",
  "Rosetta": "🌹",
  "Phase 1 and Coursework": "📖",
  "Yaksha Chat": "🤖",
  "ViBe Platform": "🌐",
  "Team Formation": "👥",
};

export default function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const mapped = (res.data || []).map((cat) => ({
        ...cat,
        icon: (cat.icon === "📁" || !cat.icon) && DEFAULT_ICONS[cat.name]
          ? DEFAULT_ICONS[cat.name]
          : (cat.icon || "📁"),
      }));
      setCategories(mapped);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, loading, refreshCategories: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);
