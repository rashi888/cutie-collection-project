import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductService from "../api/ProductService";
import CategoryService from "../api/CategoryService";
import ProductCard from "../components/ProductCard";
import CartService from "../api/CartService";
import WishlistService from "../api/WishlistService";

export default function ProductPage() {
  const [products, setProducts]               = useState([]);
  const [categories, setCategories]           = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading]                 = useState(true);

  const [page, setPage]           = useState(0);
  const [size]                    = useState(8);
  const [sortBy, setSortBy]       = useState("id");
  const [direction, setDirection] = useState("asc");
  const [keyword, setKeyword]     = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  /* ── fetch categories once ── */
  useEffect(() => {
    CategoryService.getAll()
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  /* ── fetch products whenever page / sort / keyword changes ── */
  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, direction, keyword]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      if (keyword.trim() !== "") {
        // ✅ keyword search uses /api/products/search — no pagination from backend
        const res = await ProductService.searchByKeyword(keyword.trim());
        setProducts(res.data);
        setTotalPages(1); // search results shown as single page
      } else {
        // ✅ paged endpoint — no keyword param (backend doesn't support it)
        const res = await ProductService.getPagedProducts(page, size, sortBy, direction);
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      toast.error("Failed to load products 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(0);
    try {
      setLoading(true);
      const res =
        categoryId === ""
          ? await ProductService.getAll()
          : await ProductService.getByCategory(categoryId);
      setProducts(res.data);
      setTotalPages(1);
    } catch {
      toast.error("Failed to filter products 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await CartService.addItem({ productId: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart 🛒`);
    } catch {
      toast.error("Failed to add to cart 💔");
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await WishlistService.addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist 💖`);
    } catch {
      toast.error("Failed to add to wishlist 💔");
    }
  };

  const pageButtons = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div style={S.page}>
      <style>{keyframes}</style>

      {/* ── NAVBAR ── */}
      <nav style={S.navbar}>
        <div style={S.navBrand}>
          <span style={S.navLogo}>🌸</span>
          <span style={S.navTitle}>Cutie Collection</span>
        </div>

        <div style={S.navLinks}>
          <a href="/"           style={S.navLink}>Home</a>
          <a href="/categories" style={S.navLink}>Categories</a>
          <a href="/products"   style={{ ...S.navLink, ...S.navLinkActive }}>Products</a>
          <a href="/wishlist"   style={S.navLink}>💖 Wishlist</a>
          <a href="/cart"       style={S.navLink}>🛒 Cart</a>
          <a href="/orders"     style={S.navLink}>📦 Orders</a>
        </div>

        <div style={S.navRight}>
          {/* Search */}
          <div style={S.searchBox}>
            <span style={S.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              style={S.searchInput}
            />
            {keyword && (
              <button
                onClick={() => { setKeyword(""); setPage(0); }}
                style={S.clearBtn}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort — only visible when not searching */}
          {!keyword && (
            <div style={S.sortWrapper}>
              <span style={S.sortIcon}>↕️</span>
              <select
                value={`${sortBy}-${direction}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split("-");
                  setSortBy(field);
                  setDirection(dir);
                  setPage(0);
                }}
                style={S.sortSelect}
              >
                <option value="id-asc">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name-asc">Name: A → Z</option>
                <option value="name-desc">Name: Z → A</option>
                <option value="stockQuantity-desc">Stock: High → Low</option>
              </select>
            </div>
          )}

          <button
            onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
            style={S.logoutBtn}
          >
            🌸 Logout
          </button>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={S.blob1} />
        <div style={S.blob2} />
        <div style={S.headerContent}>
          <span style={S.badge}>✨ Our Collections</span>
          <h1 style={S.title}>
            Cutie <span style={S.accent}>Products 🛍️</span>
          </h1>
          <p style={S.sub}>Handpicked adorable items just for you 💕</p>
          {keyword && (
            <p style={S.resultCount}>
              Showing results for &ldquo;<strong>{keyword}</strong>&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={S.container}>

        {/* Category filters — hidden during search */}
        {!keyword && (
          <div style={S.filterRow}>
            <button
              style={selectedCategory === "" ? S.filterBtnActive : S.filterBtn}
              onClick={() => handleCategoryFilter("")}
            >
              All 🌸
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                style={selectedCategory === String(cat.id) ? S.filterBtnActive : S.filterBtn}
                onClick={() => handleCategoryFilter(String(cat.id))}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div style={S.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, i) => (
              <div key={i} style={S.skeletonCard}>
                <div style={S.skeletonImg} />
                <div style={S.skeletonLine} />
                <div style={{ ...S.skeletonLine, width: "60%", height: "14px" }} />
                <div style={{ ...S.skeletonLine, width: "40%", height: "22px", marginTop: "8px" }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={S.emptyBox}>
            <span style={{ fontSize: "64px" }}>🛒</span>
            <p style={S.emptyText}>No products found!</p>
            <p style={S.emptySub}>Try a different search or category 💕</p>
            {keyword && (
              <button style={S.clearSearchBtn} onClick={() => setKeyword("")}>
                Clear Search ✕
              </button>
            )}
          </div>
        ) : (
          <div style={S.grid}>
            {products.map((product) => (
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

      {/* ── PAGINATION — hidden during search ── */}
      {!loading && !keyword && totalPages > 1 && (
        <div style={S.pagination}>
          <button
            style={page === 0 ? S.pageNavBtnDisabled : S.pageNavBtn}
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ← Prev
          </button>

          <div style={S.pageNumbers}>
            {pageButtons.map((p) => (
              <button
                key={p}
                style={p === page ? S.pageNumActive : S.pageNum}
                onClick={() => setPage(p)}
              >
                {p + 1}
              </button>
            ))}
          </div>

          <button
            style={page >= totalPages - 1 ? S.pageNavBtnDisabled : S.pageNavBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <p style={{ margin: 0 }}>© 2024 Cutie Collection. Made with 💕 for all cuties.</p>
      </footer>
    </div>
  );
}

/* ── Keyframes ── */
const keyframes = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const S = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#333",
  },

  /* NAVBAR */
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 60px",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    borderBottom: "1.5px solid #fce4ec",
    position: "sticky", top: 0, zIndex: 100,
    flexWrap: "wrap", gap: "12px",
    boxShadow: "0 2px 16px rgba(244,143,177,0.1)",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo:  { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: { display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" },
  navLink: {
    textDecoration: "none", color: "#c2185b",
    fontSize: "14px", fontWeight: "500",
    paddingBottom: "3px", borderBottom: "2px solid transparent",
    transition: "color 0.2s",
  },
  navLinkActive: {
    color: "#e91e8c", fontWeight: "700",
    borderBottom: "2px solid #e91e8c",
  },
  navRight: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },

  /* Search */
  searchBox: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#fff5f8", border: "1.5px solid #f8bbd0",
    borderRadius: "20px", padding: "8px 14px",
  },
  searchIcon: { fontSize: "14px", flexShrink: 0 },
  searchInput: {
    border: "none", background: "transparent", outline: "none",
    fontSize: "13px", fontFamily: "'Poppins', sans-serif",
    width: "160px", color: "#444",
  },
  clearBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#f48fb1", fontSize: "13px", fontWeight: "700",
    padding: "0 2px", lineHeight: 1,
  },

  /* Sort */
  sortWrapper: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#fff5f8", border: "1.5px solid #f8bbd0",
    borderRadius: "20px", padding: "8px 14px",
  },
  sortIcon: { fontSize: "14px", flexShrink: 0 },
  sortSelect: {
    border: "none", background: "transparent", outline: "none",
    fontSize: "13px", fontFamily: "'Poppins', sans-serif",
    color: "#c2185b", fontWeight: "500", cursor: "pointer",
    appearance: "none", WebkitAppearance: "none",
  },

  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", border: "none", borderRadius: "20px",
    padding: "8px 20px", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  /* HEADER */
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
  badge: {
    background: "#fff", color: "#e91e8c",
    border: "1.5px solid #f8bbd0", borderRadius: "20px",
    padding: "6px 16px", fontSize: "13px", fontWeight: "600",
    display: "inline-block", marginBottom: "16px",
  },
  title: { fontSize: "40px", fontWeight: "800", color: "#2d2d2d", marginBottom: "10px" },
  accent: { color: "#e91e8c" },
  sub: { fontSize: "15px", color: "#888", margin: 0 },
  resultCount: {
    marginTop: "12px", fontSize: "14px", color: "#c2185b",
    background: "rgba(255,255,255,0.7)", display: "inline-block",
    padding: "4px 14px", borderRadius: "20px", border: "1px solid #f8bbd0",
  },

  /* CONTAINER */
  container: { padding: "40px 60px", maxWidth: "1200px", margin: "0 auto" },

  /* FILTER BUTTONS */
  filterRow: {
    display: "flex", gap: "10px", flexWrap: "wrap",
    marginBottom: "36px", alignItems: "center",
  },
  filterBtn: {
    background: "#fff", color: "#c2185b",
    border: "1.5px solid #f8bbd0", borderRadius: "20px",
    padding: "8px 18px", fontSize: "13px", fontWeight: "500",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "all 0.2s",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", border: "none", borderRadius: "20px",
    padding: "8px 18px", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
  },

  /* SKELETON */
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "24px",
  },
  skeletonCard: {
    borderRadius: "24px", padding: "20px", border: "1.5px solid #f8bbd0",
    background: "#fff", display: "flex", flexDirection: "column", gap: "12px",
  },
  skeletonImg: {
    height: "180px", borderRadius: "18px",
    background: "linear-gradient(90deg, #fce4ec 25%, #fff0f5 50%, #fce4ec 75%)",
    backgroundSize: "600px 100%", animation: "shimmer 1.5s infinite linear",
  },
  skeletonLine: {
    height: "16px", borderRadius: "8px", width: "80%",
    background: "linear-gradient(90deg, #fce4ec 25%, #fff0f5 50%, #fce4ec 75%)",
    backgroundSize: "600px 100%", animation: "shimmer 1.5s infinite linear",
  },

  /* GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px", animation: "fadeInUp 0.4s ease",
  },

  /* EMPTY */
  emptyBox: {
    textAlign: "center", padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px", border: "1.5px solid #f8bbd0",
  },
  emptyText: { fontSize: "20px", fontWeight: "700", color: "#e91e8c", marginTop: "16px" },
  emptySub: { fontSize: "14px", color: "#f48fb1", marginBottom: "20px" },
  clearSearchBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", border: "none", borderRadius: "14px",
    padding: "10px 24px", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
  },

  /* PAGINATION */
  pagination: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "12px", padding: "32px 60px 0", flexWrap: "wrap",
  },
  pageNavBtn: {
    background: "#fff5f8", color: "#e91e8c",
    border: "1.5px solid #f8bbd0", borderRadius: "20px",
    padding: "10px 22px", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "all 0.2s",
  },
  pageNavBtnDisabled: {
    background: "#f5f5f5", color: "#ccc", border: "1.5px solid #eee",
    borderRadius: "20px", padding: "10px 22px", fontSize: "13px",
    fontWeight: "600", cursor: "not-allowed", fontFamily: "'Poppins', sans-serif",
  },
  pageNumbers: { display: "flex", gap: "8px", flexWrap: "wrap" },
  pageNum: {
    background: "#fff", color: "#c2185b", border: "1.5px solid #f8bbd0",
    borderRadius: "50%", width: "40px", height: "40px",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s",
  },
  pageNumActive: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", border: "none", borderRadius: "50%",
    width: "40px", height: "40px", fontSize: "13px", fontWeight: "700",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 14px rgba(233,30,140,0.32)",
  },

  /* FOOTER */
  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "28px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};