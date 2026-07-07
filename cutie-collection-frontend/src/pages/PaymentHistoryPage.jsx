import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentService from "../api/PaymentService";
import { Link } from "react-router-dom";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const res = await PaymentService.getAllPayments();
      setPayments(res.data);
    } catch (error) {
      console.error("Failed to load payments", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0,
  );

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>🌸</span>
          <span style={styles.navTitle}>Cutie Collection</span>
        </div>

        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            Home
          </Link>
          <Link to="/products" style={styles.navLink}>
            Products
          </Link>
          <Link to="/cart" style={styles.navLink}>
            🛒 Cart
          </Link>
          <Link to="/orders" style={styles.navLink}>
            📦 Orders
          </Link>

          <Link
            to="/payments"
            style={{
              ...styles.navLink,
              color: "#e91e8c",
              fontWeight: "700",
            }}
          >
            💳 Payment History
          </Link>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          style={styles.logoutBtn}
        >
          🌸 Logout
        </button>
      </nav>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>

        <div style={styles.headerContent}>
          <span style={styles.badge}>💳 Payment History</span>

          <h1 style={styles.title}>
            Your <span style={styles.accent}>Payments 🎀</span>
          </h1>

          <p style={styles.sub}>
            View all your successful transactions and spending 💕
          </p>
        </div>
      </div>

      <div style={styles.container}>
        {/* STATS */}
        {!loading && payments.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>💳</span>
              <div>
                <div style={styles.statNum}>{payments.length}</div>
                <div style={styles.statLabel}>Total Payments</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statEmoji}>✅</span>
              <div>
                <div style={styles.statNum}>
                  {
                    payments.filter(
                      (p) =>
                        p.paymentStatus === "SUCCESS" ||
                        p.paymentStatus === "PAID",
                    ).length
                  }
                </div>
                <div style={styles.statLabel}>Successful</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statEmoji}>💰</span>
              <div>
                <div style={styles.statNum}>₹{totalAmount}</div>
                <div style={styles.statLabel}>Total Spent</div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={{ fontSize: "48px" }}>💖</span>
            <p style={styles.loadingText}>Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "64px" }}>💳</span>
            <p style={styles.emptyText}>No payment history found!</p>
            <p style={styles.emptySub}>
              Your completed payments will appear here 💕
            </p>
          </div>
        ) : (
          <div style={styles.paymentGrid}>
            {payments.map((payment) => (
              <div key={payment.id} style={styles.paymentCard}>
                <div style={styles.cardTop}>
                  <span style={styles.statusBadge}>
                    ✅ {payment.paymentStatus || "PAID"}
                  </span>

                  <span style={styles.amount}>₹{payment.amount || 0}</span>
                </div>

                <div style={styles.infoRow}>
                  <strong>💳 Payment ID</strong>
                  <span>{payment.razorpayPaymentId || "N/A"}</span>
                </div>

                <div style={styles.infoRow}>
                  <strong>📦 Order ID</strong>
                  <span>{payment.razorpayOrderId || "N/A"}</span>
                </div>

                <div style={styles.infoRow}>
                  <strong>📅 Date</strong>
                  <span>
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2024 Cutie Collection. Made with 💕 for all cuties.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
  },

  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 60px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1.5px solid #fce4ec",
    position: "sticky",
    top: 0,
    zIndex: 100,
    flexWrap: "wrap",
    gap: "12px",
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
    fontSize: "20px",
    fontWeight: "700",
    color: "#e91e8c",
  },

  navLinks: {
    display: "flex",
    gap: "28px",
  },

  navLink: {
    textDecoration: "none",
    color: "#c2185b",
    fontSize: "14px",
    fontWeight: "500",
  },

  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },

  header: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    padding: "60px",
    position: "relative",
    overflow: "hidden",
  },

  blob1: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "280px",
    height: "280px",
    background: "radial-gradient(circle, #f8bbd0, #f48fb1)",
    borderRadius: "50%",
    opacity: 0.25,
    filter: "blur(50px)",
  },

  blob2: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: "240px",
    height: "240px",
    background: "radial-gradient(circle, #fce4ec, #f8bbd0)",
    borderRadius: "50%",
    opacity: 0.3,
    filter: "blur(40px)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
  },

  badge: {
    background: "#fff",
    color: "#e91e8c",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
    marginBottom: "16px",
  },

  title: {
    fontSize: "40px",
    fontWeight: "800",
    color: "#2d2d2d",
  },

  accent: {
    color: "#e91e8c",
  },

  sub: {
    color: "#888",
    marginTop: "10px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 60px",
  },

  statsRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },

  statCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0",
    borderRadius: "18px",
    padding: "20px 28px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  },

  statEmoji: {
    fontSize: "32px",
  },

  statNum: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#e91e8c",
  },

  statLabel: {
    fontSize: "12px",
    color: "#f48fb1",
  },

  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
    gap: "24px",
  },

  paymentCard: {
    background: "#fff",
    border: "1.5px solid #f8bbd0",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(233,30,140,0.08)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  statusBadge: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "8px 14px",
    borderRadius: "18px",
    fontWeight: "600",
    fontSize: "13px",
  },

  amount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#e91e8c",
  },

  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "12px 0",
    borderBottom: "1px solid #fce4ec",
    wordBreak: "break-word",
    fontSize: "14px",
  },

  loadingBox: {
    textAlign: "center",
    padding: "80px 20px",
  },

  loadingText: {
    color: "#e91e8c",
    marginTop: "12px",
  },

  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg,#fff0f5,#fce4ec)",
    borderRadius: "24px",
    border: "1.5px solid #f8bbd0",
  },

  emptyText: {
    fontSize: "22px",
    color: "#e91e8c",
    fontWeight: "700",
    marginTop: "15px",
  },

  emptySub: {
    color: "#f48fb1",
  },

  footer: {
    background: "#2d2d2d",
    textAlign: "center",
    padding: "24px",
    color: "#888",
    marginTop: "60px",
  },
};
