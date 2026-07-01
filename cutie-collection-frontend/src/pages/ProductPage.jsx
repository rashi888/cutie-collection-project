import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductService from "../api/ProductService";
import CategoryService from "../api/CategoryService";
import ProductCard from "../components/ProductCard";
import CartService from "../api/CartService";
import WishlistService from "../api/WishlistService";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await CartService.addItem({
        productId: product.id,
        quantity: 1,
      });
      toast.success(`${product.name} added to cart 🛒`);
    } catch (error) {
      toast.error("Failed to add to cart 💔");
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      setLoading(true);
      if (categoryId === "") {
        const res = await ProductService.getAll();
        setProducts(res.data);
      } else {
        const res = await ProductService.getByCategory(categoryId);
        setProducts(res.data);
      }
    } catch {
      toast.error("Failed to filter products 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await WishlistService.addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist 💖`);
    } catch (error) {
      toast.error("Failed to add to wishlist 💔");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
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
          <a href="/" style={styles.navLink}>
            Home
          </a>
          <a href="/categories" style={styles.navLink}>
            Categories
          </a>
          <a
            href="/products"
            style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}
          >
            Products
          </a>
          <a href="/wishlist" style={styles.navLink}>
            💖 Wishlist
          </a>

          <a href="/cart" style={styles.navLink}>
            🛒 Cart
          </a>

          <a href="/orders" style={styles.navLink}>
            📦 Orders
          </a>
        </div>

        <div style={styles.navRight}>
          <div style={styles.searchBox}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
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
        </div>
      </nav>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.headerContent}>
          <span style={styles.badge}>✨ Our Collections</span>
          <h1 style={styles.title}>
            Cutie <span style={styles.accent}>Products 🛍️</span>
          </h1>
          <p style={styles.sub}>Handpicked adorable items just for you 💕</p>
        </div>
      </div>

      <div style={styles.container}>
        {/* CATEGORY FILTER */}
        <div style={styles.filterRow}>
          <button
            style={
              selectedCategory === ""
                ? styles.filterBtnActive
                : styles.filterBtn
            }
            onClick={() => handleCategoryFilter("")}
          >
            All 🌸
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              style={
                selectedCategory === String(cat.id)
                  ? styles.filterBtnActive
                  : styles.filterBtn
              }
              onClick={() => handleCategoryFilter(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        {loading ? (
          <div style={styles.loadingBox}>
            <span style={{ fontSize: "48px" }}>🌸</span>
            <p style={styles.loadingText}>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyBox}>
            <span style={{ fontSize: "64px" }}>🛒</span>
            <p style={styles.emptyText}>No products found!</p>
            <p style={styles.emptySub}>Try a different search or category 💕</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
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
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
  },

  // ── NAVBAR ──
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
  navLinks: { display: "flex", gap: "28px" },
  navLink: {
    textDecoration: "none",
    color: "#c2185b",
    fontSize: "14px",
    fontWeight: "500",
  },
  navRight: { display: "flex", alignItems: "center", gap: "14px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "8px 14px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    fontFamily: "'Poppins', sans-serif",
    width: "150px",
    color: "#444",
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

  // ── HEADER ──
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

  // ── CONTAINER ──
  container: {
    padding: "40px 60px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  // ── FILTERS ──
  filterRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "32px",
  },
  filterBtn: {
    background: "#fff",
    color: "#c2185b",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  filterBtnActive: {
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

  // ── GRID ──
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
  },

  // ── LOADING ──
  loadingBox: { textAlign: "center", padding: "80px 20px" },
  loadingText: { fontSize: "16px", color: "#f48fb1", marginTop: "16px" },

  // ── EMPTY ──
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px",
    border: "1.5px solid #f8bbd0",
  },
  emptyText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#e91e8c",
    marginTop: "16px",
  },
  emptySub: { fontSize: "14px", color: "#f48fb1" },

  // ── FOOTER ──
  footer: {
    background: "#2d2d2d",
    textAlign: "center",
    padding: "24px",
    fontSize: "13px",
    color: "#666",
    marginTop: "60px",
  },
};
