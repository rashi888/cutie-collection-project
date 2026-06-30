import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CartService from "../api/CartService";
import CartItem from "../components/CartItem";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await CartService.getCart();
      //   setCartItems(res.data.items || []);
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
      setCartItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)),
      );
      toast.success("Quantity updated 🌸");
    } catch {
      toast.error("Failed to update quantity 💔");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await CartService.removeItem(itemId);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success("Item removed from cart 🛒");
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
          <a href="/" style={styles.navLink}>
            Home
          </a>
          <a href="/categories" style={styles.navLink}>
            Categories
          </a>
          <a href="/products" style={styles.navLink}>
            Products
          </a>
          <a
            href="/cart"
            style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}
          >
            🛒 Cart{" "}
            {totalItems > 0 && (
              <span style={styles.cartBadge}>{totalItems}</span>
            )}
          </a>
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
            <span style={{ fontSize: "48px" }}>🌸</span>
            <p style={styles.loadingText}>Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "72px" }}>🛒</span>
            <p style={styles.emptyText}>Your cart is empty!</p>
            <p style={styles.emptySub}>
              Add something cute from our collection 💕
            </p>
            <button
              style={styles.shopNowBtn}
              onClick={() => navigate("/products")}
            >
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <div style={styles.layout}>
            {/* CART ITEMS LIST */}
            <div style={styles.itemsList}>
              <div style={styles.listHeader}>
                <h2 style={styles.sectionTitle}>Cart Items</h2>
                <button
                  style={styles.clearBtn}
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
                  <span
                    style={{
                      ...styles.summaryValue,
                      color: "#2e7d32",
                      fontWeight: "600",
                    }}
                  >
                    FREE 🎀
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Discount</span>
                  <span style={{ ...styles.summaryValue, color: "#e91e8c" }}>
                    — ₹0.00
                  </span>
                </div>

                <div style={styles.divider} />

                <div style={{ ...styles.summaryRow, marginTop: "4px" }}>
                  <span style={styles.totalLabel}>Total</span>
                  <span style={styles.totalValue}>₹{total.toFixed(2)}</span>
                </div>

                <button style={styles.checkoutBtn}>
                  Proceed to Checkout 💕
                </button>

                <button
                  style={styles.continueBtn}
                  onClick={() => navigate("/products")}
                >
                  ← Continue Shopping
                </button>
              </div>

              {/* Cute promo note */}
              <div style={styles.promoCard}>
                <span style={{ fontSize: "24px" }}>🎀</span>
                <div>
                  <p style={styles.promoTitle}>Free Shipping!</p>
                  <p style={styles.promoSub}>
                    On all orders — because you deserve it 💕
                  </p>
                </div>
              </div>
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
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
  },

  // Navbar
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
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: { display: "flex", gap: "28px", alignItems: "center" },
  navLink: {
    textDecoration: "none",
    color: "#c2185b",
    fontSize: "14px",
    fontWeight: "500",
  },
  cartBadge: {
    background: "#e91e8c",
    color: "#fff",
    borderRadius: "50%",
    fontSize: "10px",
    fontWeight: "700",
    padding: "1px 6px",
    marginLeft: "4px",
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
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },

  // Header
  header: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    padding: "60px 60px 50px",
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
  headerContent: { position: "relative", zIndex: 1 },
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
    marginBottom: "10px",
  },
  accent: { color: "#e91e8c" },
  sub: { fontSize: "15px", color: "#888" },

  // Container
  container: { padding: "40px 60px", maxWidth: "1200px", margin: "0 auto" },

  // Loading / Empty
  loadingBox: { textAlign: "center", padding: "80px 20px" },
  loadingText: { fontSize: "16px", color: "#f48fb1", marginTop: "16px" },
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px",
    border: "1.5px solid #f8bbd0",
  },
  emptyText: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#e91e8c",
    marginTop: "16px",
  },
  emptySub: { fontSize: "14px", color: "#f48fb1", marginBottom: "24px" },
  shopNowBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },

  // Layout
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "32px",
    alignItems: "flex-start",
  },

  // Items list
  itemsList: { display: "flex", flexDirection: "column", gap: "16px" },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  clearBtn: {
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c2185b",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  itemsStack: { display: "flex", flexDirection: "column", gap: "14px" },

  // Summary card
  summary: { display: "flex", flexDirection: "column", gap: "16px" },
  summaryCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 8px 32px rgba(244,143,177,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { fontSize: "14px", color: "#888" },
  summaryValue: { fontSize: "14px", fontWeight: "600", color: "#333" },
  divider: { borderTop: "1.5px dashed #f8bbd0", margin: "4px 0" },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#333" },
  totalValue: { fontSize: "22px", fontWeight: "800", color: "#e91e8c" },
  checkoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 16px rgba(233,30,140,0.3)",
    marginTop: "4px",
  },
  continueBtn: {
    background: "#fff0f5",
    color: "#c2185b",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    padding: "12px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },

  // Promo card
  promoCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0",
    borderRadius: "18px",
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  promoTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#c2185b",
    margin: 0,
  },
  promoSub: { fontSize: "12px", color: "#f48fb1", margin: 0, marginTop: "3px" },

  // Footer
  footer: {
    background: "#2d2d2d",
    textAlign: "center",
    padding: "24px",
    fontSize: "13px",
    color: "#666",
    marginTop: "60px",
  },
};
