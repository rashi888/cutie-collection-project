import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OrderService from "../api/OrderService";
import OrderCard from "../components/OrderCard";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await OrderService.getMyOrders();
      setOrders(res.data);
    } catch {
      toast.error("Failed to load orders 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? 🥺")) return;
    try {
      await OrderService.cancelOrder(orderId);
      toast.success("Order cancelled 💔");
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to cancel order 💔");
    }
  };

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>🌸</span>
          <span style={styles.navTitle}>Cutie Collection</span>
        </div>
        <div style={styles.navLinks}>
          <a href="/" style={styles.navLink}>Home</a>
          <a href="/products" style={styles.navLink}>Products</a>
          <a href="/cart" style={styles.navLink}>🛒 Cart</a>
          <a href="/orders" style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}>
            📦 Orders
          </a>
        </div>
        <button
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={styles.logoutBtn}
        >
          🌸 Logout
        </button>
      </nav>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.headerContent}>
          <span style={styles.badge}>📦 My Orders</span>
          <h1 style={styles.title}>
            Your <span style={styles.accent}>Orders 🎀</span>
          </h1>
          <p style={styles.sub}>Track and manage your cutie purchases 💕</p>
        </div>
      </div>

      <div style={styles.container}>

        {/* STATS */}
        {!loading && orders.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>📦</span>
              <div>
                <div style={styles.statNum}>{orders.length}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>✅</span>
              <div>
                <div style={styles.statNum}>
                  {orders.filter((o) => o.orderStatus === "DELIVERED").length}
                </div>
                <div style={styles.statLabel}>Delivered</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statEmoji}>⏳</span>
              <div>
                <div style={styles.statNum}>
                  {orders.filter((o) => o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED").length}
                </div>
                <div style={styles.statLabel}>Active</div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS LIST */}
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={{ fontSize: "48px" }}>🌸</span>
            <p style={styles.loadingText}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "64px" }}>📦</span>
            <p style={styles.emptyText}>No orders yet!</p>
            <p style={styles.emptySub}>Start shopping and place your first order 💕</p>
            <button style={styles.shopBtn} onClick={() => navigate("/products")}>
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancel}
              />
              
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
  page: { fontFamily: "'Poppins', sans-serif", background: "#fff", minHeight: "100vh" },

  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 60px", background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)", borderBottom: "1.5px solid #fce4ec",
    position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "12px",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: { display: "flex", gap: "28px" },
  navLink: { textDecoration: "none", color: "#c2185b", fontSize: "14px", fontWeight: "500" },
  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "20px", padding: "8px 18px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },

  header: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    padding: "60px 60px 50px", position: "relative", overflow: "hidden",
  },
  blob1: {
    position: "absolute", top: "-80px", right: "-60px", width: "280px", height: "280px",
    background: "radial-gradient(circle, #f8bbd0, #f48fb1)", borderRadius: "50%",
    opacity: 0.25, filter: "blur(50px)",
  },
  blob2: {
    position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px",
    background: "radial-gradient(circle, #fce4ec, #f8bbd0)", borderRadius: "50%",
    opacity: 0.3, filter: "blur(40px)",
  },
  headerContent: { position: "relative", zIndex: 1 },
  badge: {
    background: "#fff", color: "#e91e8c", border: "1.5px solid #f8bbd0",
    borderRadius: "20px", padding: "6px 16px", fontSize: "13px",
    fontWeight: "600", display: "inline-block", marginBottom: "16px",
  },
  title: { fontSize: "40px", fontWeight: "800", color: "#2d2d2d", marginBottom: "10px" },
  accent: { color: "#e91e8c" },
  sub: { fontSize: "15px", color: "#888" },

  container: { padding: "40px 60px", maxWidth: "1000px", margin: "0 auto" },

  statsRow: { display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" },
  statCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0", borderRadius: "18px",
    padding: "20px 28px", display: "flex", alignItems: "center",
    gap: "16px", flex: 1, minWidth: "140px",
  },
  statEmoji: { fontSize: "32px" },
  statNum: { fontSize: "24px", fontWeight: "700", color: "#e91e8c" },
  statLabel: { fontSize: "12px", color: "#f48fb1", fontWeight: "500" },

  ordersList: { display: "flex", flexDirection: "column", gap: "20px" },

  loadingBox: { textAlign: "center", padding: "80px 20px" },
  loadingText: { fontSize: "16px", color: "#f48fb1", marginTop: "16px" },
  emptyBox: {
    textAlign: "center", padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px", border: "1.5px solid #f8bbd0",
  },
  emptyText: { fontSize: "20px", fontWeight: "700", color: "#e91e8c", marginTop: "16px" },
  emptySub: { fontSize: "14px", color: "#f48fb1", marginBottom: "24px" },
  shopBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "14px", padding: "13px 28px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
  },

  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "24px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};