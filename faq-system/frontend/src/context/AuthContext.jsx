import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (err) {
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setCurrentUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);