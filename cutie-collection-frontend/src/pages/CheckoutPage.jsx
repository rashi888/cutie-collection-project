import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CartService from "../api/CartService";
import OrderService from "../api/OrderService";
import CheckoutSummary from "../components/CheckoutSummary";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await CartService.getCart();
      setCartItems(res.data);
    } catch {
      toast.error("Failed to load cart 💔");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty 💔");
      return;
    }
    try {
      setPlacing(true);
      await OrderService.placeOrder();
      toast.success("Order placed successfully! 🎀");
      navigate("/orders");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to place order 💔");
    } finally {
      setPlacing(false);
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
          <a href="/orders" style={styles.navLink}>📦 Orders</a>
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
          <span style={styles.badge}>💳 Checkout</span>
          <h1 style={styles.title}>
            Almost <span style={styles.accent}>There! 🎀</span>
          </h1>
          <p style={styles.sub}>Review your order and place it 💕</p>
        </div>
      </div>

      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={{ fontSize: "48px" }}>🌸</span>
            <p style={styles.loadingText}>Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "64px" }}>🛒</span>
            <p style={styles.emptyText}>Nothing to checkout!</p>
            <p style={styles.emptySub}>Add some cute items first 💕</p>
            <button style={styles.shopBtn} onClick={() => navigate("/products")}>
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <div style={styles.layout}>

            {/* LEFT — Delivery Info */}
            <div style={styles.leftCol}>
              <div style={styles.infoCard}>
                <h2 style={styles.sectionTitle}>📦 Delivery Details</h2>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Delivery Type</span>
                  <span style={styles.infoValue}>Standard Delivery</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Estimated</span>
                  <span style={styles.infoValue}>3–5 Business Days</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Shipping Fee</span>
                  <span style={{ ...styles.infoValue, color: "#2e7d32", fontWeight: "700" }}>
                    FREE 🎀
                  </span>
                </div>
              </div>

              <div style={styles.infoCard}>
                <h2 style={styles.sectionTitle}>💳 Payment</h2>
                <div style={styles.paymentOption}>
                  <span style={styles.paymentDot} />
                  <span style={styles.paymentLabel}>Cash on Delivery</span>
                  <span style={styles.paymentBadge}>✅ Selected</span>
                </div>
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div style={styles.rightCol}>
              <CheckoutSummary
                cartItems={cartItems}
                onPlaceOrder={handlePlaceOrder}
                placing={placing}
              />
            </div>
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

  container: { padding: "40px 60px", maxWidth: "1200px", margin: "0 auto" },

  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px", alignItems: "flex-start" },
  leftCol: { display: "flex", flexDirection: "column", gap: "24px" },
  rightCol: {},

  infoCard: {
    background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
    borderRadius: "24px", padding: "28px",
    border: "1.5px solid #f8bbd0", boxShadow: "0 8px 32px rgba(244,143,177,0.12)",
    display: "flex", flexDirection: "column", gap: "16px",
    fontFamily: "'Poppins', sans-serif",
  },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#333", margin: 0 },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: "14px", color: "#888" },
  infoValue: { fontSize: "14px", fontWeight: "600", color: "#333" },

  paymentOption: { display: "flex", alignItems: "center", gap: "12px" },
  paymentDot: {
    width: "14px", height: "14px", borderRadius: "50%",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    flexShrink: 0,
  },
  paymentLabel: { fontSize: "14px", fontWeight: "600", color: "#333", flex: 1 },
  paymentBadge: {
    background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9",
    borderRadius: "20px", padding: "3px 12px", fontSize: "11px", fontWeight: "600",
  },

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