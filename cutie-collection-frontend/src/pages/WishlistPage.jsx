import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import WishlistService from "../api/WishlistService";
import CartService from "../api/CartService";
import WishlistCard from "../components/WishlistCard";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await WishlistService.getWishlist();
      setWishlist(res.data);
    } catch {
      toast.error("Failed to load wishlist 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      setTimeout(() => {
        setWishlist((prev) => prev.filter((i) => i.productId !== productId));
        toast.success("Removed from wishlist 💔");
      }, 300);
    } catch {
      toast.error("Failed to remove 💔");
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await CartService.addItem({ productId: item.productId, quantity: 1 });
      toast.success(`${item.productName} added to cart 🛒`);
    } catch {
      toast.error("Failed to add to cart 💔");
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm("Clear your entire wishlist? 🥺")) return;
    setClearing(true);
    try {
      await WishlistService.clearWishlist();
      setWishlist([]);
      toast.success("Wishlist cleared 🌸");
    } catch {
      toast.error("Failed to clear wishlist 💔");
    } finally {
      setClearing(false);
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
          <a href="/"        style={styles.navLink}>Home</a>
          <a href="/products" style={styles.navLink}>Products</a>
          <a href="/cart"    style={styles.navLink}>🛒 Cart</a>
          <a href="/wishlist" style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}>
            💖 Wishlist
          </a>
          <a href="/orders"  style={styles.navLink}>📦 Orders</a>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
        >
          🌸 Logout
        </button>
      </nav>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.headerContent}>
          <span style={styles.headerBadge}>💖 My Wishlist</span>
          <h1 style={styles.title}>
            Your <span style={styles.accent}>Wishlist 🌸</span>
          </h1>
          <p style={styles.sub}>
            {wishlist.length > 0
              ? `${wishlist.length} cutie item${wishlist.length > 1 ? "s" : ""} saved for later 💕`
              : "Your wishlist is empty — save something cute! 🌸"}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={styles.spinner} />
            <p style={styles.loadingText}>Loading your wishlist...</p>
          </div>

        ) : wishlist.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "72px" }}>💖</span>
            <p style={styles.emptyText}>Your wishlist is empty!</p>
            <p style={styles.emptySub}>Browse products and save your favorites 🌸</p>
            <button style={styles.shopBtn} onClick={() => navigate("/products")}>
              Shop Now 🌸
            </button>
          </div>

        ) : (
          <div style={styles.layout}>

            {/* List Header */}
            <div style={styles.listHeader}>
              <h2 style={styles.sectionTitle}>
                Saved Items
                <span style={styles.countBadge}>{wishlist.length}</span>
              </h2>
              <button
                style={{
                  ...styles.clearBtn,
                  opacity:    clearing ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
                onClick={handleClearWishlist}
                disabled={clearing}
              >
                {clearing ? "Clearing..." : "🗑️ Clear All"}
              </button>
            </div>

            {/* Wishlist Items */}
            <div style={styles.itemsStack}>
              {wishlist.map((item) => (
                <WishlistCard
                  key={item.productId}
                  item={item}
                  onRemove={handleRemove}
                  onAddToCart={handleAddToCart}
                />
              ))}
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
  navBrand:  { display: "flex", alignItems: "center", gap: "10px" },
  navLogo:   { fontSize: "28px" },
  navTitle:  { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks:  { display: "flex", gap: "28px", alignItems: "center" },
  navLink:   { textDecoration: "none", color: "#c2185b", fontSize: "14px", fontWeight: "500" },
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
    position: "absolute", top: "-80px", right: "-60px",
    width: "280px", height: "280px",
    background: "radial-gradient(circle, #f8bbd0, #f48fb1)",
    borderRadius: "50%", opacity: 0.25, filter: "blur(50px)",
  },
  blob2: {
    position: "absolute", bottom: "-60px", left: "-60px",
    width: "240px", height: "240px",
    background: "radial-gradient(circle, #fce4ec, #f8bbd0)",
    borderRadius: "50%", opacity: 0.3, filter: "blur(40px)",
  },
  headerContent: { position: "relative", zIndex: 1 },
  headerBadge: {
    background: "#fff", color: "#e91e8c", border: "1.5px solid #f8bbd0",
    borderRadius: "20px", padding: "6px 16px", fontSize: "13px",
    fontWeight: "600", display: "inline-block", marginBottom: "16px",
  },
  title:  { fontSize: "40px", fontWeight: "800", color: "#2d2d2d", marginBottom: "10px" },
  accent: { color: "#e91e8c" },
  sub:    { fontSize: "15px", color: "#888" },

  container: { padding: "40px 60px", maxWidth: "1000px", margin: "0 auto" },

  loadingBox:   { textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  spinner: {
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
  emptySub:  { fontSize: "14px", color: "#f48fb1", marginBottom: "24px" },
  shopBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "20px", padding: "12px 28px",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },

  layout:      { display: "flex", flexDirection: "column", gap: "20px" },
  listHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: {
    fontSize: "20px", fontWeight: "700", color: "#333",
    margin: 0, display: "flex", alignItems: "center", gap: "10px",
  },
  countBadge: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "2px 10px",
  },
  clearBtn: {
    background: "#fff5f8", border: "1.5px solid #f8bbd0", borderRadius: "12px",
    padding: "8px 16px", fontSize: "13px", fontWeight: "600",
    color: "#c2185b", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  },
  itemsStack: { display: "flex", flexDirection: "column", gap: "14px" },

  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "24px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};