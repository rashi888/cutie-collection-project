import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import PaymentService from "../api/PaymentService";

import {
  showError,
} from "../utils/toastUtils";

const PAYMENT_STATUS_STYLES = {
  PENDING: {
    background: "#fff8e1",
    color: "#a96100",
    border: "#ffe082",
    label: "⏳ Pending",
  },

  PAID: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "#c8e6c9",
    label: "✅ Paid",
  },

  SUCCESS: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "#c8e6c9",
    label: "✅ Successful",
  },

  FAILED: {
    background: "#ffebee",
    color: "#c62828",
    border: "#ffcdd2",
    label: "❌ Failed",
  },

  REFUNDED: {
    background: "#e3f2fd",
    color: "#1565c0",
    border: "#bbdefb",
    label: "↩️ Refunded",
  },
};

export default function PaymentHistoryPage() {
  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  const loadPayments =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await PaymentService.getAllPayments();

        setPayments(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        setPayments([]);

        showError(
          error,
          "Unable to load payment history"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const successfulPayments = useMemo(
    () =>
      payments.filter((payment) =>
        ["PAID", "SUCCESS"].includes(
          payment.paymentStatus
        )
      ),
    [payments]
  );

  const successfulAmount = useMemo(
    () =>
      successfulPayments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      ),
    [successfulPayments]
  );

  const failedPaymentsCount = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.paymentStatus ===
          "FAILED"
      ).length,
    [payments]
  );

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("role");
    localStorage.removeItem(
      "username"
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <Link
          to="/"
          style={styles.brandLink}
        >
          <div style={styles.navBrand}>
            <span
              style={styles.navLogo}
              aria-hidden="true"
            >
              🌸
            </span>

            <span style={styles.navTitle}>
              Cutie Collection
            </span>
          </div>
        </Link>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
          >
            Home
          </Link>

          <Link
            to="/admin/categories"
            style={styles.navLink}
          >
            Categories
          </Link>

          <Link
            to="/admin/products"
            style={styles.navLink}
          >
            Products
          </Link>

          <Link
            to="/admin/payments"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            💳 Payments
          </Link>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          🌸 Logout
        </button>
      </nav>

      {/* Header */}
      <header style={styles.header}>
        <div
          style={styles.blobOne}
          aria-hidden="true"
        />

        <div
          style={styles.blobTwo}
          aria-hidden="true"
        />

        <div style={styles.headerContent}>
          <span style={styles.headerBadge}>
            💳 Admin Payment Dashboard
          </span>

          <h1 style={styles.title}>
            Payment{" "}
            <span style={styles.accent}>
              History 🎀
            </span>
          </h1>

          <p style={styles.subtitle}>
            Review payment transactions,
            statuses, amounts, and Razorpay
            references.
          </p>
        </div>
      </header>

      <main style={styles.container}>
        {/* Statistics */}
        {!loading && payments.length > 0 && (
          <section style={styles.statsGrid}>
            <StatCard
              icon="💳"
              value={payments.length}
              label="Total Payments"
            />

            <StatCard
              icon="✅"
              value={
                successfulPayments.length
              }
              label="Successful"
            />

            <StatCard
              icon="❌"
              value={failedPaymentsCount}
              label="Failed"
            />

            <StatCard
              icon="💰"
              value={`₹${formatCurrency(
                successfulAmount
              )}`}
              label="Successful Amount"
            />
          </section>
        )}

        {!loading && payments.length > 0 && (
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.listTitle}>
                All Transactions
              </h2>

              <p style={styles.listText}>
                Payment amounts shown here
                were calculated and verified
                by the backend.
              </p>
            </div>

            <button
              type="button"
              style={styles.refreshButton}
              onClick={loadPayments}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div
            style={styles.statusBox}
            role="status"
            aria-live="polite"
          >
            <span
              style={styles.statusIcon}
              aria-hidden="true"
            >
              💖
            </span>

            <p style={styles.statusTitle}>
              Loading payments...
            </p>

            <p style={styles.statusText}>
              Please wait while transaction
              information is loaded.
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div style={styles.statusBox}>
            <span
              style={styles.statusIcon}
              aria-hidden="true"
            >
              💳
            </span>

            <p style={styles.statusTitle}>
              No payment records found
            </p>

            <p style={styles.statusText}>
              Verified payment transactions
              will appear here.
            </p>
          </div>
        ) : (
          <div style={styles.paymentGrid}>
            {payments.map((payment) => {
              const status =
                payment.paymentStatus ||
                "PENDING";

              const statusStyle =
                PAYMENT_STATUS_STYLES[
                  status
                ] ||
                PAYMENT_STATUS_STYLES
                  .PENDING;

              const applicationOrderId =
                payment.orderId ??
                payment.applicationOrderId;

              const paymentDate =
                payment.paymentDate ??
                payment.createdAt;

              return (
                <article
                  key={
                    payment.id ??
                    payment
                      .razorpayPaymentId
                  }
                  style={styles.paymentCard}
                >
                  <div style={styles.cardTop}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background:
                          statusStyle.background,
                        color:
                          statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {statusStyle.label}
                    </span>

                    <span
                      style={styles.amount}
                    >
                      ₹
                      {formatCurrency(
                        payment.amount
                      )}
                    </span>
                  </div>

                  <PaymentInfo
                    label="Application Order"
                    value={
                      payment.orderNumber ||
                      applicationOrderId ||
                      "Not available"
                    }
                  />

                  <PaymentInfo
                    label="Razorpay Payment ID"
                    value={
                      payment
                        .razorpayPaymentId ||
                      "Not available"
                    }
                  />

                  <PaymentInfo
                    label="Razorpay Order ID"
                    value={
                      payment
                        .razorpayOrderId ||
                      "Not available"
                    }
                  />

                  <PaymentInfo
                    label="Currency"
                    value={
                      payment.currency ||
                      "INR"
                    }
                  />

                  <PaymentInfo
                    label="Transaction Date"
                    value={formatDate(
                      paymentDate
                    )}
                  />
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Cutie
        Collection. Made with 💕 for all
        cuties.
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <article style={styles.statCard}>
      <span
        style={styles.statIcon}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div>
        <strong style={styles.statValue}>
          {value}
        </strong>

        <span style={styles.statLabel}>
          {label}
        </span>
      </div>
    </article>
  );
}

function PaymentInfo({
  label,
  value,
}) {
  return (
    <div style={styles.infoRow}>
      <strong style={styles.infoLabel}>
        {label}
      </strong>

      <span style={styles.infoValue}>
        {value}
      </span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#333333",
    fontFamily: "'Poppins', sans-serif",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 5%",
    borderBottom: "1.5px solid #fce4ec",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
  },

  brandLink: {
    textDecoration: "none",
  },

  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navLogo: {
    fontSize: "28px",
  },

  navTitle: {
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "700",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
  },

  navLink: {
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  activeNavLink: {
    color: "#e91e8c",
    fontWeight: "700",
  },

  logoutButton: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  header: {
    position: "relative",
    padding: "60px 5%",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  blobOne: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #f8bbd0, #f48fb1)",
    opacity: 0.25,
    filter: "blur(50px)",
  },

  blobTwo: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #fce4ec, #f8bbd0)",
    opacity: 0.3,
    filter: "blur(40px)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
  },

  headerBadge: {
    display: "inline-block",
    marginBottom: "16px",
    padding: "6px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "600",
  },

  title: {
    margin: "0 0 10px",
    color: "#2d2d2d",
    fontSize: "clamp(32px, 6vw, 40px)",
    fontWeight: "800",
  },

  accent: {
    color: "#e91e8c",
  },

  subtitle: {
    margin: 0,
    color: "#777777",
    fontSize: "14px",
  },

  container: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "40px 0 70px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  statIcon: {
    fontSize: "30px",
  },

  statValue: {
    display: "block",
    color: "#e91e8c",
    fontSize: "21px",
    fontWeight: "800",
    overflowWrap: "anywhere",
  },

  statLabel: {
    display: "block",
    marginTop: "3px",
    color: "#9f5575",
    fontSize: "11px",
    fontWeight: "600",
  },

  listHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  listTitle: {
    margin: "0 0 5px",
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "700",
  },

  listText: {
    margin: 0,
    color: "#777777",
    fontSize: "12px",
  },

  refreshButton: {
    padding: "8px 15px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "11px",
    background: "#fff5f8",
    color: "#a81750",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "600",
  },

  paymentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },

  paymentCard: {
    padding: "24px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow:
      "0 10px 30px rgba(233,30,140,0.08)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "18px",
    fontSize: "11px",
    fontWeight: "700",
  },

  amount: {
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "800",
  },

  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "11px 0",
    borderBottom: "1px solid #fce4ec",
  },

  infoLabel: {
    color: "#a81750",
    fontSize: "11px",
  },

  infoValue: {
    color: "#555555",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  statusBox: {
    padding: "65px 20px",
    border: "1.5px dashed #f8bbd0",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #fffafd, #fff0f5)",
    textAlign: "center",
  },

  statusIcon: {
    display: "block",
    marginBottom: "12px",
    fontSize: "52px",
  },

  statusTitle: {
    margin: "0 0 7px",
    color: "#c2185b",
    fontSize: "19px",
    fontWeight: "700",
  },

  statusText: {
    margin: 0,
    color: "#777777",
    fontSize: "12px",
  },

  footer: {
    padding: "24px",
    background: "#2d2d2d",
    color: "#999999",
    fontSize: "12px",
    textAlign: "center",
  },
};