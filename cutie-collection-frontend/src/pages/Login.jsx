import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AuthService from "../api/AuthService";

import {
  showError,
  showSuccess,
} from "../utils/toastUtils";

const INITIAL_FORM = {
  email: "",
  password: "",
};

export default function Login() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (token) {
      navigate("/", {
        replace: true,
      });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,
      value,
    }));
  };

  const validateForm = () => {
    const email = form.email.trim();

    if (!email) {
      showError(
        "Please enter your email address"
      );
      return false;
    }

    if (!form.password) {
      showError(
        "Please enter your password"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await AuthService.login({
          email: form.email
            .trim()
            .toLowerCase(),
          password: form.password,
        });

      const authData = response.data;

      if (!authData?.accessToken) {
        throw new Error(
          "The access token was missing from the login response"
        );
      }

      const authenticatedUser = {
        id: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      };

      localStorage.setItem(
        "token",
        authData.accessToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          authenticatedUser
        )
      );

      /*
       * Remove values used by the previous
       * frontend authentication structure.
       */
      localStorage.removeItem(
        "username"
      );

      localStorage.removeItem("role");

      showSuccess(
        `Welcome back, ${
          authData.name || "Cutie"
        }!`
      );

      const requestedPath =
        location.state?.from;

      const destination =
        requestedPath ||
        (authData.role === "ADMIN"
          ? "/admin/products"
          : "/");

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      showError(
        error,
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.wrapper}>
      <div
        style={styles.blobTop}
        aria-hidden="true"
      />

      <div
        style={styles.blobBottom}
        aria-hidden="true"
      />

      <section
        style={styles.card}
        aria-labelledby="login-heading"
      >
        {/* Header */}
        <header style={styles.logoArea}>
          <Link
            to="/"
            style={styles.homeLink}
            aria-label="Go to homepage"
          >
            <span
              style={styles.logoIcon}
              aria-hidden="true"
            >
              🌸
            </span>
          </Link>

          <h1
            id="login-heading"
            style={styles.brandName}
          >
            The Cutie Collection
          </h1>

          <p style={styles.tagline}>
            Welcome back, cutie!
          </p>
        </header>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
          noValidate
        >
          <div style={styles.inputGroup}>
            <label
              htmlFor="login-email"
              style={styles.label}
            >
              Email
            </label>

            <div style={styles.inputWrapper}>
              <span
                style={styles.inputIcon}
                aria-hidden="true"
              >
                ✉️
              </span>

              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="hello@cutie.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={150}
                disabled={loading}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label
              htmlFor="login-password"
              style={styles.label}
            >
              Password
            </label>

            <div style={styles.inputWrapper}>
              <span
                style={styles.inputIcon}
                aria-hidden="true"
              >
                🔒
              </span>

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                maxLength={100}
                disabled={loading}
                required
                style={styles.input}
              />

              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() =>
                  setShowPassword(
                    (currentValue) =>
                      !currentValue
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading
                ? 0.65
                : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Logging in..."
              : "Login 🌷"}
          </button>
        </form>

        <div style={styles.securityNote}>
          <span aria-hidden="true">
            🔒
          </span>

          <span>
            Your password is transmitted
            securely and verified using
            BCrypt-protected credentials.
          </span>
        </div>

        {/* Footer */}
        <p style={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            style={styles.footerLink}
          >
            Sign up ✨
          </Link>
        </p>

        <p style={styles.browseText}>
          <Link
            to="/products"
            style={styles.browseLink}
          >
            Continue browsing without
            signing in
          </Link>
        </p>
      </section>
    </main>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    display: "flex",
    minHeight: "100vh",
    padding: "24px",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    fontFamily:
      "'Poppins', sans-serif",
  },

  blobTop: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #f8bbd0 0%, #f48fb1 100%)",
    opacity: 0.35,
    filter: "blur(40px)",
  },

  blobBottom: {
    position: "absolute",
    bottom: "-100px",
    left: "-80px",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #fce4ec 0%, #f8bbd0 100%)",
    opacity: 0.4,
    filter: "blur(50px)",
  },

  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    padding: "48px 40px",
    border:
      "1.5px solid rgba(248, 187, 208, 0.4)",
    borderRadius: "28px",
    background:
      "rgba(255, 255, 255, 0.9)",
    boxShadow:
      "0 20px 60px rgba(244, 143, 177, 0.25)",
    backdropFilter: "blur(20px)",
  },

  logoArea: {
    marginBottom: "28px",
    textAlign: "center",
  },

  homeLink: {
    display: "inline-block",
    textDecoration: "none",
  },

  logoIcon: {
    display: "block",
    marginBottom: "8px",
    fontSize: "44px",
  },

  brandName: {
    margin: "0 0 4px",
    color: "#e91e8c",
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },

  tagline: {
    margin: 0,
    color: "#b85d82",
    fontSize: "14px",
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
    paddingLeft: "4px",
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "600",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    background: "#fff5f8",
  },

  inputIcon: {
    flexShrink: 0,
    marginRight: "10px",
    fontSize: "16px",
  },

  input: {
    minWidth: 0,
    flex: 1,
    padding: "13px 0",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#444444",
    fontFamily:
      "'Poppins', sans-serif",
    fontSize: "14px",
  },

  passwordToggle: {
    flexShrink: 0,
    marginLeft: "8px",
    padding: "5px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
  },

  submitButton: {
    width: "100%",
    marginTop: "4px",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292 0%, #e91e8c 100%)",
    boxShadow:
      "0 6px 20px rgba(233, 30, 140, 0.35)",
    color: "#ffffff",
    fontFamily:
      "'Poppins', sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },

  securityNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "20px",
    padding: "11px 13px",
    border: "1px solid #f8bbd0",
    borderRadius: "12px",
    background: "#fffafd",
    color: "#777777",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  footerText: {
    margin: "24px 0 0",
    color: "#777777",
    fontSize: "13px",
    textAlign: "center",
  },

  footerLink: {
    color: "#c2185b",
    fontWeight: "700",
    textDecoration: "none",
  },

  browseText: {
    margin: "12px 0 0",
    fontSize: "11px",
    textAlign: "center",
  },

  browseLink: {
    color: "#a81750",
    fontWeight: "600",
    textDecoration: "none",
  },
};