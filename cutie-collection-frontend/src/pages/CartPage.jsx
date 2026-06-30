import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CartService from "../api/CartService";
import CartItem from "../components/CartItem";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

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

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await CartService.updateItem(itemId, { quantity: newQty });
      setCartItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)));
      setBadgeKey((k) => k + 1);
      toast.success("Quantity updated 🌸");
    } catch {
      toast.error("Failed to update quantity 💔");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await CartService.removeItem(itemId);
      setTimeout(() => {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
        setBadgeKey((k) => k + 1);
      }, 280);
      toast.success("Item removed 🛒");
    } catch {
      toast.error("Failed to remove item 💔");
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear your entire cart? 🥺")) return;
    setClearing(true);
    try {
      await CartService.clearCart();
      setCartItems([]);
      setBadgeKey((k) => k + 1);
      toast.success("Cart cleared 🌸");
    } catch {
      toast.error("Failed to clear cart 💔");
    } finally {
      setClearing(false);
    }
  };

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

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
          <a href="/categories" style={styles.navLink}>Categories</a>
          <a href="/products" style={styles.navLink}>Products</a>
          <a href="/cart" style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700", position: "relative" }}>
            🛒 Cart
            {totalItems > 0 && (
              <span key={badgeKey} className="badge-pop" style={styles.cartBadge}>
                {totalItems}
              </span>
            )}
          </a>
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
          <span style={styles.badge}>🛒 My Cart</span>
          <h1 style={styles.title}>
            Your <span style={styles.accent}>Cutie Cart 💕</span>
          </h1>
          <p style={styles.sub}>
            {totalItems > 0
              ? `${totalItems} adorable item${totalItems > 1 ? "s" : ""} waiting for you!`
              : "Your cart is empty — go shop something cute! 🌸"}
          </p>
        </div>
      </div>

      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={styles.loadingSpinner} />
            <p style={styles.loadingText}>Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ ...styles.emptyBox, animation: "fadeInUp 0.4s ease" }}>
            <span style={{ fontSize: "72px" }}>🛒</span>
            <p style={styles.emptyText}>Your cart is empty!</p>
            <p style={styles.emptySub}>Add something cute from our collection 💕</p>
            <button style={styles.shopNowBtn} onClick={() => navigate("/products")}>
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <div style={styles.layout}>

            {/* CART ITEMS */}
            <div style={styles.itemsList}>
              <div style={styles.listHeader}>
                <h2 style={styles.sectionTitle}>
                  Cart Items
                  <span style={styles.itemCountBadge}>{cartItems.length}</span>
                </h2>
                <button
                  style={{ ...styles.clearBtn, opacity: clearing ? 0.6 : 1, transition: "background 0.2s, opacity 0.2s" }}
                  onClick={handleClearCart}
                  disabled={clearing}
                >
                  {clearing ? "Clearing..." : "🗑️ Clear Cart"}
                </button>
              </div>
              <div style={styles.itemsStack}>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div style={styles.summary}>
              <div style={styles.summaryCard}>
                <h2 style={styles.summaryTitle}>Order Summary 🌸</h2>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Items ({totalItems})</span>
                  <span style={styles.summaryValue}>₹{total.toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Delivery</span>
                  <span style={{ ...styles.summaryValue, color: "#2e7d32", fontWeight: "600" }}>FREE 🎀</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Discount</span>
                  <span style={{ ...styles.summaryValue, color: "#e91e8c" }}>— ₹0.00</span>
                </div>
                <div style={styles.divider} />
                <div style={{ ...styles.summaryRow, marginTop: "4px" }}>
                  <span style={styles.totalLabel}>Total</span>
                  <span style={styles.totalValue}>₹{total.toFixed(2)}</span>
                </div>
                <button
                  className="checkout-btn"
                  style={styles.checkoutBtn}
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout 💕
                </button>
                <button style={styles.continueBtn} onClick={() => navigate("/products")}>
                  ← Continue Shopping
                </button>
              </div>

              <div style={styles.promoCard}>
                <span style={{ fontSize: "24px" }}>🎀</span>
                <div>
                  <p style={styles.promoTitle}>Free Shipping!</p>
                  <p style={styles.promoSub}>On all orders — because you deserve it 💕</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
  navLinks: { display: "flex", gap: "28px", alignItems: "center" },
  navLink: { textDecoration: "none", color: "#c2185b", fontSize: "14px", fontWeight: "500" },
  cartBadge: {
    position: "absolute", top: "-8px", right: "-12px",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", borderRadius: "50%", fontSize: "10px", fontWeight: "700",
    minWidth: "18px", height: "18px",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(233,30,140,0.4)", border: "2px solid #fff",
  },
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
  loadingBox: { textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  loadingSpinner: {
    display: "inline-block", width: "44px", height: "44px",
    border: "4px solid #fce4ec", borderTop: "4px solid #e91e8c",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "16px", color: "#f48fb1", margin: 0 },
  emptyBox: {
    textAlign: "center", padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px", border: "1.5px solid #f8bbd0",
  },
  emptyText: { fontSize: "22px", fontWeight: "700", color: "#e91e8c", marginTop: "16px" },
  emptySub: { fontSize: "14px", color: "#f48fb1", marginBottom: "24px" },
  shopNowBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "20px", padding: "12px 28px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },
  layout: { display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "flex-start" },
  itemsList: { display: "flex", flexDirection: "column", gap: "16px" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", color: "#333", margin: 0, display: "flex", alignItems: "center", gap: "10px" },
  itemCountBadge: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "2px 10px",
  },
  clearBtn: {
    background: "#fff5f8", border: "1.5px solid #f8bbd0", borderRadius: "12px",
    padding: "8px 16px", fontSize: "13px", fontWeight: "600",
    color: "#c2185b", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  },
  itemsStack: { display: "flex", flexDirection: "column", gap: "14px" },
  summary: { display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "90px" },
  summaryCard: {
    background: "#fff", borderRadius: "24px", padding: "28px",
    border: "1.5px solid #f8bbd0", boxShadow: "0 8px 32px rgba(244,143,177,0.12)",
    display: "flex", flexDirection: "column", gap: "14px",
  },
  summaryTitle: { fontSize: "18px", fontWeight: "700", color: "#333", margin: 0 },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: "14px", color: "#888" },
  summaryValue: { fontSize: "14px", fontWeight: "600", color: "#333" },
  divider: { borderTop: "1.5px dashed #f8bbd0", margin: "4px 0" },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#333" },
  totalValue: { fontSize: "22px", fontWeight: "800", color: "#e91e8c" },
  checkoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "14px", padding: "14px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 16px rgba(233,30,140,0.3)", marginTop: "4px",
  },
  continueBtn: {
    background: "#fff0f5", color: "#c2185b", border: "1.5px solid #f8bbd0",
    borderRadius: "14px", padding: "12px", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  },
  promoCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)", border: "1.5px solid #f8bbd0",
    borderRadius: "18px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "14px",
  },
  promoTitle: { fontSize: "14px", fontWeight: "700", color: "#c2185b", margin: 0 },
  promoSub: { fontSize: "12px", color: "#f48fb1", margin: 0, marginTop: "3px" },
  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "24px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};