import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CategoryService from "../api/CategoryService";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAll();
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories 💔");
    } finally {
      setLoading(false);
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
          <a href="/categories" style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}>
            Categories
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
      <div style={styles.header}>  {/* ✅ was: styes.header */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.headerContent}>
          <span style={styles.badge}>✨ Browse Our Collections</span>
          <h1 style={styles.title}>
            Shop by <span style={styles.accent}>Category 💝</span>
          </h1>
          <p style={styles.sub}>Find your favourite cutie picks</p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={{ fontSize: "48px" }}>🌸</span>
            <p style={styles.loadingText}>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "64px" }}>🛍️</span>
            <p style={styles.emptyText}>No categories yet!</p>
            <p style={styles.emptySub}>Check back soon for cute collections 💕</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {categories.map((cat) => (
              <div key={cat.id} style={styles.card}>
                <span style={styles.cardEmoji}>🏷️</span>
                <h3 style={styles.cardName}>{cat.name}</h3>
                {cat.description && (
                  <p style={styles.cardDesc}>{cat.description}</p>
                )}
                <button style={styles.shopBtn}>Shop Now 🛍️</button>
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "20px", padding: "28px 20px",
    border: "1.5px solid #f8bbd0", textAlign: "center",
    boxShadow: "0 4px 20px rgba(244,143,177,0.1)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
  },
  cardEmoji: { fontSize: "40px" },
  cardName: { fontSize: "15px", fontWeight: "700", color: "#333" },
  cardDesc: { fontSize: "12px", color: "#888", lineHeight: "1.5" },
  shopBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "12px", padding: "9px 20px",
    fontSize: "12px", fontWeight: "600", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", marginTop: "6px",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },
  loadingBox: { textAlign: "center", padding: "80px 20px" },
  loadingText: { fontSize: "16px", color: "#f48fb1", marginTop: "16px" },
  emptyBox: {
    textAlign: "center", padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px", border: "1.5px solid #f8bbd0",
  },
  emptyText: { fontSize: "20px", fontWeight: "700", color: "#e91e8c", marginTop: "16px" },
  emptySub: { fontSize: "14px", color: "#f48fb1" },
  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "24px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};