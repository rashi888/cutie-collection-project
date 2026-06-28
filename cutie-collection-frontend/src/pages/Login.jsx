import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

import {
  showSuccess,
  showError,
} from "../utils/toastUtils";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  
useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    navigate("/home");
  }
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      showError("Please fill in all fields 🌷");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      localStorage.setItem(
  "token",
  response.data.token
);

localStorage.setItem(
  "username",
  response.data.name
);
      

      showSuccess("Welcome back, Cutie! 💕");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Invalid email or password 💔";

      showError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.blobTop} />
      <div style={styles.blobBottom} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>🌸</span>
          <h1 style={styles.brandName}>The Cutie Collection</h1>
          <p style={styles.tagline}>Welcome back, cutie! 💕</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉️</span>

              <input
                type="email"
                name="email"
                placeholder="hello@cutie.com"
                value={form.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Your secret password"
                value={form.password}
                onChange={handleChange}
                required
                style={styles.input}
              />

              <span
                style={styles.toggleEye}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <div style={styles.forgotRow}>
            <Link
              to="/forgot-password"
              style={styles.forgotLink}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login 🌷"}
          </button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>
            or continue with
          </span>
          <span style={styles.dividerLine} />
        </div>

        {/* Social */}
        <div style={styles.socialRow}>
          <button style={styles.socialBtn}>
            🌐 Google
          </button>

          <button style={styles.socialBtn}>
            🍎 Apple
          </button>
        </div>

        {/* Footer */}
        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={styles.footerLink}
          >
            Sign up ✨
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Poppins', sans-serif",
  },

  blobTop: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "320px",
    height: "320px",
    background:
      "radial-gradient(circle, #f8bbd0 0%, #f48fb1 100%)",
    borderRadius: "50%",
    opacity: 0.35,
    filter: "blur(40px)",
  },

  blobBottom: {
    position: "absolute",
    bottom: "-100px",
    left: "-80px",
    width: "380px",
    height: "380px",
    background:
      "radial-gradient(circle, #fce4ec 0%, #f8bbd0 100%)",
    borderRadius: "50%",
    opacity: 0.4,
    filter: "blur(50px)",
  },

  card: {
    background: "rgba(255, 255, 255, 0.88)",
    backdropFilter: "blur(20px)",
    borderRadius: "28px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow:
      "0 20px 60px rgba(244, 143, 177, 0.25)",
    border:
      "1.5px solid rgba(248, 187, 208, 0.4)",
    position: "relative",
    zIndex: 1,
  },

  logoArea: {
    textAlign: "center",
    marginBottom: "28px",
  },

  logoIcon: {
    fontSize: "44px",
    display: "block",
    marginBottom: "8px",
  },

  brandName: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#e91e8c",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },

  tagline: {
    fontSize: "14px",
    color: "#f48fb1",
    fontWeight: "400",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#c2185b",
    paddingLeft: "4px",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    padding: "0 14px",
  },

  inputIcon: {
    fontSize: "16px",
    marginRight: "10px",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "13px 0",
    fontSize: "14px",
    color: "#444",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
  },

  toggleEye: {
    cursor: "pointer",
    fontSize: "16px",
    marginLeft: "8px",
    flexShrink: 0,
  },

  forgotRow: {
    textAlign: "right",
    marginTop: "-8px",
  },

  forgotLink: {
    fontSize: "12px",
    color: "#f48fb1",
    textDecoration: "none",
    fontWeight: "500",
  },

  btn: {
    background:
      "linear-gradient(135deg, #f06292 0%, #e91e8c 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.5px",
    boxShadow:
      "0 6px 20px rgba(233, 30, 140, 0.35)",
    fontFamily: "'Poppins', sans-serif",
    marginTop: "4px",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "24px 0 16px",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#f8bbd0",
  },

  dividerText: {
    fontSize: "12px",
    color: "#f48fb1",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },

  socialRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },

  socialBtn: {
    flex: 1,
    padding: "11px",
    borderRadius: "12px",
    border: "1.5px solid #f8bbd0",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "500",
    color: "#c2185b",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },

  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#aaa",
  },

  footerLink: {
    color: "#e91e8c",
    fontWeight: "600",
    textDecoration: "none",
  },
};