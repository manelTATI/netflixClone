import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/authCheck");
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Login failed" };
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const signup = async (username, email, password) => {
    setAuthError("");
    try {
      const res = await axios.post("/api/auth/signup", { username, email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Sign up failed" };
    } catch (err) {
      const msg = err.response?.data?.message || "Sign up failed. Please try again.";
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
