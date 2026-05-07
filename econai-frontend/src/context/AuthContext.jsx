import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:5001/api";

// Attach JWT to every axios request globally
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("econai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("econai_token"));
  const [loading, setLoading] = useState(true);

  // Rehydrate user from stored token on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("econai_token");
    if (storedToken) {
      axios
        .get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((res) => {
          setUser(res.data);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem("econai_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("econai_token", data.token);
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, createdAt: data.createdAt });
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    // Don't auto-login — caller will redirect to /login
    return data;
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
    saveSession(data);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("econai_token");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = async (updates) => {
    const { data } = await axios.put(`${API_BASE}/auth/profile`, updates);
    saveSession(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
