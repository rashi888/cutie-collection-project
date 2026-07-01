import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import ProductService from "../api/ProductService";
import CartService from "../api/CartService";
import WishlistService from "../api/WishlistService";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await ProductService.getById(id);
        setProduct(res.data);
      } catch {
        toast.error("Product not found 💔");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (adding || product.stockQuantity <= 0) return;
    try {
      setAdding(true);
      await CartService.addItem({ productId: product.id, quantity: 1 });
      setAdded(true);
      toast.success(`${product.name} added to cart 🛒`);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart 💔");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    try {
      if (wishlisted) {
        await WishlistService.removeFromWishlist(product.id);
        setWishlisted(false);
        toast.success("Removed from wishlist 💔");
      } else {
        await WishlistService.addToWishlist(product.id);
        setWishlisted(true);
        toast.success(`${product.name} added to wishlist 💖`);
      }
    } catch {
      toast.error("Failed to update wishlist 💔");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingBox}>
          <span style={{ fontSize: "64px" }}>🌸</span>
          <p style={styles.loadingText}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div style={styles.page}>
      {/* ── NAVBAR ── */}
      <nav style={styles.navbar}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={styles.navBrand}>
            <span style={styles.navLogo}>🌸</span>
            <span style={styles.navTitle}>Cutie Collection</span>
          </div>
        </Link>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          <Link to="/categories" style={styles.navLink}>Categories</Link>
          <Link to="/products" style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}>Products</Link>
          <Link to="/wishlist" style={styles.navLink}>💖 Wishlist</Link>
          <Link to="/cart" style={styles.navLink}>🛒 Cart</Link>
          <Link to="/orders" style={styles.navLink}>📦 Orders</Link>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>🌸 Logout</button>
      </nav>

      {/* ── BREADCRUMB ── */}
      <div style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSep}>›</span>
        <Link to="/products" style={styles.breadcrumbLink}>Products</Link>
        <span style={styles.breadcrumbSep}>›</span>
        <span style={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.container}>
        <div style={styles.layout}>

          {/* LEFT — Image */}
          <div style={styles.imageSection}>
            <div style={styles.imageBox}>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={styles.image}
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <div style={{ ...styles.imageFallback, display: product.imageUrl ? "none" : "flex" }}>
                <span style={{ fontSize: "100px" }}>🛍️</span>
              </div>
            </div>

            {/* Floating badges */}
            {product.categoryName && (
              <div style={styles.categoryBadge}>{product.categoryName}</div>
            )}
          </div>

          {/* RIGHT — Details */}
          <div style={styles.detailsSection}>

            {/* Stock badge */}
            <div style={outOfStock ? styles.outOfStockBadge : styles.inStockBadge}>
              {outOfStock ? "❌ Out of Stock" : `✅ In Stock (${product.stockQuantity} left)`}
            </div>

            {/* Name */}
            <h1 style={styles.productName}>{product.name}</h1>

            {/* Price */}
            <div style={styles.priceBox}>
              <span style={styles.price}>₹{product.price}</span>
              <span style={styles.priceSub}>Free delivery on orders above ₹499</span>
            </div>

            {/* Description */}
            {product.description && (
              <div style={styles.descBox}>
                <h3 style={styles.descTitle}>📝 Description</h3>
                <p style={styles.desc}>{product.description}</p>
              </div>
            )}

            {/* Highlights */}
            <div style={styles.highlights}>
              <div style={styles.highlight}>
                <span style={styles.highlightIcon}>🚚</span>
                <div>
                  <div style={styles.highlightTitle}>Free Delivery</div>
                  <div style={styles.highlightSub}>3–5 business days</div>
                </div>
              </div>
              <div style={styles.highlight}>
                <span style={styles.highlightIcon}>↩️</span>
                <div>
                  <div style={styles.highlightTitle}>Easy Returns</div>
                  <div style={styles.highlightSub}>7-day return policy</div>
                </div>
              </div>
              <div style={styles.highlight}>
                <span style={styles.highlightIcon}>🔒</span>
                <div>
                  <div style={styles.highlightTitle}>Secure Payment</div>
                  <div style={styles.highlightSub}>100% safe checkout</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button
                style={
                  outOfStock
                    ? { ...styles.addToCartBtn, opacity: 0.5, cursor: "not-allowed" }
                    : added
                    ? { ...styles.addToCartBtn, background: "linear-gradient(135deg, #66bb6a, #2e7d32)" }
                    : styles.addToCartBtn
                }
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
              >
                {adding ? "Adding... 🌸" : added ? "✅ Added to Cart!" : "🛒 Add to Cart"}
              </button>

              <button
                style={wishlisted ? styles.wishlistBtnActive : styles.wishlistBtn}
                onClick={handleWishlist}
              >
                {wishlisted ? "❤️ Wishlisted" : "🤍 Wishlist"}
              </button>
            </div>

            {/* Buy Now */}
            {!outOfStock && (
              <Link to="/checkout" style={{ textDecoration: "none" }}>
                <button style={styles.buyNowBtn}>⚡ Buy Now</button>
              </Link>
            )}

            {/* Back link */}
            <Link to="/products" style={styles.backLink}>
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <p>© 2024 Cutie Collection. Made with 💕 for all cuties.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: "'Poppins', sans-serif", background: "#fff", minHeight: "100vh" },

  // NAVBAR
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 60px", background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)", borderBottom: "1.5px solid #fce4ec",
    position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "12px",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  navLogo: { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: { display: "flex", gap: "24px", flexWrap: "wrap" },
  navLink: { textDecoration: "none", color: "#c2185b", fontSize: "14px", fontWeight: "500" },
  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "20px", padding: "8px 18px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },

  // BREADCRUMB
  breadcrumb: {
    padding: "14px 60px", display: "flex", alignItems: "center", gap: "8px",
    background: "#fff5f8", borderBottom: "1px solid #fce4ec",
  },
  breadcrumbLink: { textDecoration: "none", color: "#f48fb1", fontSize: "13px", fontWeight: "500" },
  breadcrumbSep: { color: "#f8bbd0", fontSize: "13px" },
  breadcrumbCurrent: { color: "#e91e8c", fontSize: "13px", fontWeight: "600" },

  // LOADING
  loadingBox: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "60vh", gap: "16px",
  },
  loadingText: { fontSize: "16px", color: "#f48fb1", fontFamily: "'Poppins', sans-serif" },

  // LAYOUT
  container: { padding: "48px 60px", maxWidth: "1200px", margin: "0 auto" },
  layout: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "60px", alignItems: "flex-start",
  },

  // IMAGE SECTION
  imageSection: { position: "relative" },
  imageBox: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    borderRadius: "28px", height: "420px",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", border: "2px solid #f8bbd0",
    boxShadow: "0 12px 40px rgba(244,143,177,0.2)",
  },
  image: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "28px" },
  imageFallback: {
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute", top: "16px", left: "16px",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", borderRadius: "20px", padding: "6px 16px",
    fontSize: "12px", fontWeight: "700",
    boxShadow: "0 4px 12px rgba(233,30,140,0.3)",
  },

  // DETAILS SECTION
  detailsSection: { display: "flex", flexDirection: "column", gap: "20px" },

  inStockBadge: {
    display: "inline-block", background: "#f0fff4", color: "#2e7d32",
    border: "1.5px solid #c8e6c9", borderRadius: "20px",
    padding: "6px 16px", fontSize: "12px", fontWeight: "700", alignSelf: "flex-start",
  },
  outOfStockBadge: {
    display: "inline-block", background: "#fff5f5", color: "#c62828",
    border: "1.5px solid #ffcdd2", borderRadius: "20px",
    padding: "6px 16px", fontSize: "12px", fontWeight: "700", alignSelf: "flex-start",
  },

  productName: {
    fontSize: "32px", fontWeight: "800", color: "#2d2d2d",
    lineHeight: "1.3", margin: 0,
  },

  priceBox: { display: "flex", flexDirection: "column", gap: "4px" },
  price: { fontSize: "36px", fontWeight: "800", color: "#e91e8c" },
  priceSub: { fontSize: "12px", color: "#aaa" },

  descBox: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "16px", padding: "20px",
    border: "1.5px solid #f8bbd0",
  },
  descTitle: { fontSize: "14px", fontWeight: "700", color: "#c2185b", margin: "0 0 8px 0" },
  desc: { fontSize: "14px", color: "#666", lineHeight: "1.7", margin: 0 },

  highlights: { display: "flex", flexDirection: "column", gap: "12px" },
  highlight: {
    display: "flex", alignItems: "center", gap: "14px",
    background: "#fff5f8", borderRadius: "14px",
    padding: "14px 18px", border: "1px solid #fce4ec",
  },
  highlightIcon: { fontSize: "22px", flexShrink: 0 },
  highlightTitle: { fontSize: "13px", fontWeight: "700", color: "#333" },
  highlightSub: { fontSize: "11px", color: "#aaa" },

  actions: { display: "flex", gap: "12px" },
  addToCartBtn: {
    flex: 1, background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", border: "none", borderRadius: "16px",
    padding: "16px 24px", fontSize: "15px", fontWeight: "700",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
    transition: "all 0.3s ease",
  },
  wishlistBtn: {
    background: "#fff5f8", color: "#e91e8c",
    border: "1.5px solid #f8bbd0", borderRadius: "16px",
    padding: "16px 20px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    transition: "all 0.2s ease",
  },
  wishlistBtnActive: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)", color: "#e91e8c",
    border: "1.5px solid #e91e8c", borderRadius: "16px",
    padding: "16px 20px", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  },
  buyNowBtn: {
    width: "100%", background: "#2d2d2d", color: "#fff",
    border: "none", borderRadius: "16px", padding: "16px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
  backLink: {
    textDecoration: "none", color: "#f48fb1",
    fontSize: "13px", fontWeight: "600",
    display: "inline-block", marginTop: "4px",
  },

  // FOOTER
  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "24px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};