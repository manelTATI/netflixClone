import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (isSignUp && !username) {
      setLocalError("Please enter a username.");
      return;
    }

    setSubmitting(true);
    let result;
    if (isSignUp) {
      result = await signup(username, email, password);
    } else {
      result = await login(email, password);
    }
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setLocalError(result.message);
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    setLocalError("");
    // Try login or auto signup demo user
    let res = await login("demo@netflix.com", "Netflix123");
    if (!res.success) {
      res = await signup("NetflixViewer", "demo@netflix.com", "Netflix123");
    }
    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setLocalError(res.message);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(10px)",
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-up"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "rgba(0, 0, 0, 0.88)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "8px",
          padding: "44px 38px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.9)",
          color: "#ffffff",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            color: "var(--netflix-light-gray)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={22} />
        </button>

        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "24px",
          }}
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        {localError && (
          <div
            style={{
              backgroundColor: "rgba(229, 9, 20, 0.2)",
              border: "1px solid var(--netflix-red)",
              color: "#ff7b7b",
              padding: "10px 14px",
              borderRadius: "4px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && (
            <div style={{ position: "relative" }}>
              <UserIcon
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "16px",
                  color: "var(--netflix-gray)",
                }}
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 40px",
                  backgroundColor: "#333333",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <Mail
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "16px",
                color: "var(--netflix-gray)",
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 14px 14px 40px",
                backgroundColor: "#333333",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "16px",
                color: "var(--netflix-gray)",
              }}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 14px 14px 40px",
                backgroundColor: "#333333",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "8px",
              padding: "14px",
              backgroundColor: "var(--netflix-red)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "4px",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--netflix-red-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--netflix-red)")}
          >
            {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Demo Fast Login */}
        <button
          onClick={handleDemoLogin}
          disabled={submitting}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "12px",
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)")}
        >
          🚀 Instant Demo Login (1-Click)
        </button>

        {/* Toggle between Sign In and Sign Up */}
        <div style={{ marginTop: "24px", fontSize: "14px", color: "var(--netflix-gray)" }}>
          {isSignUp ? "Already have an account?" : "New to Netflix?"}{" "}
          <span
            onClick={() => {
              setIsSignUp((prev) => !prev);
              setLocalError("");
            }}
            style={{ color: "#ffffff", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
          >
            {isSignUp ? "Sign in now." : "Sign up now."}
          </span>
        </div>

        <p style={{ marginTop: "16px", fontSize: "11px", color: "#737373", lineHeight: 1.4 }}>
          This page is protected by Google reCAPTCHA to ensure you're not a bot.
        </p>
      </div>
    </div>
  );
};
