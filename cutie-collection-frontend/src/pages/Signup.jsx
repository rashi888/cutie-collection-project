import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthService from "../api/AuthService";

import {
  showError,
  showSuccess,
} from "../utils/toastUtils";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Signup() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

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
const { name, value } = event.target;
setForm((currentForm) => ({
...currentForm,
[name]: value,
}));
};

  const validateForm = () => {
    const normalizedName =
      form.name.trim();

    const normalizedEmail =
      form.email.trim();

    if (!normalizedName) {
      showError(
        "Please enter your full name"
      );

      return false;
    }

    if (normalizedName.length < 2) {
      showError(
        "Name must contain at least 2 characters"
      );

      return false;
    }

    if (normalizedName.length > 100) {
      showError(
        "Name cannot exceed 100 characters"
      );

      return false;
    }

    if (!normalizedEmail) {
      showError(
        "Please enter your email address"
      );

      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        normalizedEmail
      )
    ) {
      showError(
        "Please enter a valid email address"
      );

      return false;
    }

    if (normalizedEmail.length > 150) {
      showError(
        "Email cannot exceed 150 characters"
      );

      return false;
    }

    if (!form.password) {
      showError(
        "Please create a password"
      );

      return false;
    }

    if (form.password.length < 8) {
      showError(
        "Password must contain at least 8 characters"
      );

      return false;
    }

    if (form.password.length > 100) {
      showError(
        "Password cannot exceed 100 characters"
      );

      return false;
    }

    if (!form.confirmPassword) {
      showError(
        "Please confirm your password"
      );

      return false;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      showError(
        "Passwords do not match"
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

    const requestData = {
      name: form.name.trim(),

      email: form.email
        .trim()
        .toLowerCase(),

      password: form.password,
    };

    try {
      setLoading(true);

      await AuthService.signup(
        requestData
      );

      showSuccess(
        "Account created successfully. Please log in."
      );

      setForm(INITIAL_FORM);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      showError(
        error,
        "Unable to create your account"
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength =
    form.password.length === 0
      ? null
      : form.password.length < 8
        ? {
            text: "Password is too short",
            color: "#c62828",
          }
        : form.password.length < 12
          ? {
              text: "Password strength: Good",
              color: "#b26a00",
            }
          : {
              text: "Password strength: Strong",
              color: "#2e7d32",
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
        aria-labelledby="signup-heading"
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
            id="signup-heading"
            style={styles.brandName}
          >
            The Cutie Collection
          </h1>

          <p style={styles.tagline}>
            Join the cutie club!
          </p>
        </header>

        {/* Signup form */}
        <form
          onSubmit={handleSubmit}
          style={styles.form}
          noValidate
        >
          {/* Full name */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="signup-name"
              style={styles.label}
            >
              Full Name
            </label>

            <div style={styles.inputWrapper}>
              <span
                style={styles.inputIcon}
                aria-hidden="true"
              >
                🌷
              </span>

              <input
                id="signup-name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="signup-email"
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
                id="signup-email"
                type="email"
                name="email"
                placeholder="hello@cutie.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={150}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="signup-password"
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
                id="signup-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={loading}
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

          {/* Password strength */}
          {passwordStrength && (
            <p
              style={{
                ...styles.hint,
                color:
                  passwordStrength.color,
              }}
            >
              {passwordStrength.text}
            </p>
          )}

          {/* Confirm password */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="signup-confirm-password"
              style={styles.label}
            >
              Confirm Password
            </label>

            <div style={styles.inputWrapper}>
              <span
                style={styles.inputIcon}
                aria-hidden="true"
              >
                🔑
              </span>

              <input
                id="signup-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Repeat your password"
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={loading}
                style={styles.input}
              />

              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() =>
                  setShowConfirmPassword(
                    (currentValue) =>
                      !currentValue
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
                aria-pressed={
                  showConfirmPassword
                }
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </button>
            </div>
          </div>

          {form.confirmPassword &&
            form.password !==
              form.confirmPassword && (
              <p style={styles.errorHint}>
                Passwords do not match
              </p>
            )}

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
              ? "Creating account..."
              : "Create Account 🌸"}
          </button>
        </form>

        <div style={styles.securityNote}>
          <span aria-hidden="true">
            🔒
          </span>

          <span>
            Your password will be securely
            hashed by the backend before it
            is stored.
          </span>
        </div>

        {/* Footer */}
        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={styles.footerLink}
          >
            Login 💕
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
    boxSizing: "border-box",
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
    padding: "44px 40px",
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
    marginBottom: "26px",
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
    gap: "16px",
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

  hint: {
    margin: "-8px 0 0",
    paddingLeft: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },

  errorHint: {
    margin: "-8px 0 0",
    paddingLeft: "4px",
    color: "#c62828",
    fontSize: "11px",
    fontWeight: "600",
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