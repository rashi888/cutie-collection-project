import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import ProductService from "../api/ProductService";
import CartService from "../api/CartService";
import WishlistService from "../api/WishlistService";

export default function ProductDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [adding,     setAdding]     = useState(false);
  const [added,      setAdded]      = useState(false);   // ✅ starts false — NOT true
  const [wishlisted, setWishlisted] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  // ✅ Stable ref to avoid re-registering effect on every render
  const idRef = useRef(id);
  idRef.current = id;

  /* ── Fetch product ── */
  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      try {
        const res = await ProductService.getById(id);
        if (!cancelled) setProduct(res.data);
      } catch {
        if (!cancelled) {
          toast.error("Product not found 💔");
          navigate("/products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProduct();
    return () => { cancelled = true; }; // ✅ cleanup on unmount / id change
  }, [id]);

  /* ── Check wishlist ── */
  useEffect(() => {
    let cancelled = false;
    const checkWishlist = async () => {
      try {
        const res = await WishlistService.getWishlist();
        const exists = res.data.some(
          (item) => (item.product?.id ?? item.productId) === Number(id),
        );
        if (!cancelled) setWishlisted(exists);
      } catch {
        // silent — wishlist check is non-critical
      }
    };
    checkWishlist();
    return () => { cancelled = true; };
  }, [id]);

  
 useEffect(() => {
    loadProduct();
  }, []);

const loadProduct = async () => {
  try {

    console.log("ID = ", id);

    const res =
      await ProductService.getProductById(id);

    console.log("PRODUCT = ", res.data);

    setProduct(res.data);

  } catch (error) {

    console.log("ERROR");
    console.log(error);

    console.log(error.response);
    console.log(error.response?.data);

  }
};


  /* ── Handlers (memoized) ── */
  const handleAddToCart = useCallback(async () => {
    if (adding || !product || product.stockQuantity <= 0) return;
    try {
      setAdding(true);
      await CartService.addItem({ productId: product.id, quantity: 1 });
      setAdded(true); // ✅ only set after successful API call
      toast.success(`${product.name} added to cart 🛒`);
    } catch {
      toast.error("Failed to add to cart 💔");
    } finally {
      setAdding(false);
    }
  }, [adding, product]);

  const handleWishlist = useCallback(async () => {
    if (!product) return;
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
  }, [wishlisted, product]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const handleGoToCart = useCallback(() => navigate("/cart"), [navigate]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={S.page}>
        <style>{keyframes}</style>
        <div style={S.loadingBox}>
          <span style={S.loadingSpinner}>🌸</span>
          <p style={S.loadingText}>Loading product...</p>
          <div style={S.loadingDots}>
            <span style={{ ...S.dot, animationDelay: "0s" }} />
            <span style={{ ...S.dot, animationDelay: "0.2s" }} />
            <span style={{ ...S.dot, animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div style={S.page}>
      <style>{keyframes}</style>

      {/* ── NAVBAR ── */}
      <nav style={S.navbar}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={S.navBrand}>
            <span style={S.navLogo}>🌸</span>
            <span style={S.navTitle}>Cutie Collection</span>
          </div>
        </Link>

        <div style={S.navLinks}>
          <Link to="/"           style={S.navLink}>Home</Link>
          <Link to="/categories" style={S.navLink}>Categories</Link>
          <Link to="/products"   style={{ ...S.navLink, ...S.navLinkActive }}>Products</Link>
          <Link to="/wishlist"   style={S.navLink}>💖 Wishlist</Link>
          <Link to="/cart"       style={S.navLink}>🛒 Cart</Link>
          <Link to="/orders"     style={S.navLink}>📦 Orders</Link>
        </div>

        <button onClick={handleLogout} style={S.logoutBtn} className="pdp-logout">
          🌸 Logout
        </button>
      </nav>

      {/* ── BREADCRUMB ── */}
      <div style={S.breadcrumb}>
        <Link to="/"         style={S.breadcrumbLink} className="pdp-breadcrumb-a">Home</Link>
        <span style={S.breadcrumbSep}>›</span>
        <Link to="/products" style={S.breadcrumbLink} className="pdp-breadcrumb-a">Products</Link>
        <span style={S.breadcrumbSep}>›</span>
        <span style={S.breadcrumbCurrent}>{product.name}</span>
      </div>

      {/* ── MAIN ── */}
      <div style={S.container}>
        <div style={S.layout}>

          {/* LEFT — Image */}
          <div style={S.imageSection}>
            <div
              style={{
                ...S.imageBox,
                boxShadow: imgHovered
                  ? "0 20px 60px rgba(244,143,177,0.38)"
                  : "0 12px 40px rgba(244,143,177,0.2)",
              }}
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => setImgHovered(false)}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    ...S.image,
                    transform: imgHovered ? "scale(1.05)" : "scale(1)",
                  }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div style={{ ...S.imageFallback, display: product.imageUrl ? "none" : "flex" }}>
                <span style={{ fontSize: "100px" }}>🛍️</span>
              </div>
            </div>

            {product.categoryName && (
              <div style={S.categoryBadge}>{product.categoryName}</div>
            )}

            <div style={outOfStock ? S.stockTagOut : S.stockTagIn}>
              {outOfStock ? "❌ Out of Stock" : `✅ ${product.stockQuantity} left`}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div style={S.detailsSection}>

            <h1 style={S.productName}>{product.name}</h1>

            <div style={S.priceRow}>
              <span style={S.price}>₹{product.price}</span>
              <div style={S.freeDeliveryTag}>🚚 FREE Delivery</div>
            </div>
            <p style={S.priceSub}>Free delivery on orders above ₹499 💕</p>

            <div style={S.divider} />

            {product.description && (
              <div style={S.descBox}>
                <h3 style={S.descTitle}>📝 Description</h3>
                <p style={S.desc}>{product.description}</p>
              </div>
            )}

            {/* Highlights — static array defined outside component */}
            <div style={S.highlights}>
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} style={S.highlight} className="pdp-highlight-row">
                  <span style={S.highlightIcon}>{h.icon}</span>
                  <div>
                    <div style={S.highlightTitle}>{h.title}</div>
                    <div style={S.highlightSub}>{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={S.divider} />

            {/* ── Action Buttons ── */}
            <div style={S.actions}>
              {!added ? (
                <button
                  className="pdp-cart-btn"
                  style={
                    outOfStock
                      ? { ...S.addToCartBtn, opacity: 0.5, cursor: "not-allowed" }
                      : adding
                      ? { ...S.addToCartBtn, opacity: 0.8 }
                      : S.addToCartBtn
                  }
                  onClick={handleAddToCart}
                  disabled={outOfStock || adding}
                >
                  {adding ? "Adding... 🌸" : "🛒 Add to Cart"}
                </button>
              ) : (
                <button style={S.goToCartBtn} onClick={handleGoToCart}>
                  ✅ Go to Cart →
                </button>
              )}

              <button
                className="pdp-wishlist-btn"
                style={wishlisted ? S.wishlistBtnActive : S.wishlistBtn}
                onClick={handleWishlist}
              >
                {wishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            {!outOfStock && (
              <Link to="/checkout" style={{ textDecoration: "none" }}>
                <button className="pdp-buynow-btn" style={S.buyNowBtn}>
                  ⚡ Buy Now
                </button>
              </Link>
            )}

            {/* Trust badges — static array outside component */}
            <div style={S.trustRow}>
              {TRUST_BADGES.map((t) => (
                <span key={t} style={S.trustBadge}>{t}</span>
              ))}
            </div>

            <Link to="/products" style={S.backLink} className="pdp-back">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <p style={{ margin: 0 }}>© 2024 Cutie Collection. Made with 💕 for all cuties.</p>
      </footer>
    </div>
  );
}

/* ── Static data outside component — no re-creation on render ── */
const HIGHLIGHTS = [
  { icon: "🚚", title: "Free Delivery",  sub: "3–5 business days" },
  { icon: "↩️", title: "Easy Returns",   sub: "7-day return policy" },
  { icon: "🔒", title: "Secure Payment", sub: "100% safe checkout" },
  { icon: "🌸", title: "Cutie Quality",  sub: "Handpicked with love" },
];

const TRUST_BADGES = ["✅ Genuine Product", "🔄 Easy Returns", "💳 Secure Pay"];

/* ── Keyframes (injected once via <style>) ── */
const keyframes = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%            { transform: scale(1);   opacity: 1; }
  }
  @keyframes spinFloat {
    0%   { transform: rotate(0deg)   scale(1); }
    50%  { transform: rotate(180deg) scale(1.15); }
    100% { transform: rotate(360deg) scale(1); }
  }
  .pdp-cart-btn:hover:not(:disabled) {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 28px rgba(233,30,140,0.45) !important;
  }
  .pdp-cart-btn:active:not(:disabled) { transform: scale(0.97) !important; }
  .pdp-wishlist-btn:hover {
    background: #fce4ec !important;
    border-color: #e91e8c !important;
    transform: scale(1.08) !important;
  }
  .pdp-buynow-btn:hover {
    background: #1a1a1a !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.22) !important;
  }
  .pdp-buynow-btn:active { transform: scale(0.97) !important; }
  .pdp-highlight-row:hover {
    background: #fce4ec !important;
    border-color: #f8bbd0 !important;
  }
  .pdp-logout:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 18px rgba(233,30,140,0.38) !important;
  }
  .pdp-back:hover { color: #e91e8c !important; }
  .pdp-breadcrumb-a:hover { color: #e91e8c !important; }
`;

/* ── Styles (object outside component — created once) ── */
const S = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#333",
  },

  /* LOADING */
  loadingBox: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    minHeight: "80vh", gap: "16px",
  },
  loadingSpinner: { fontSize: "64px", display: "block", animation: "spinFloat 1.8s linear infinite" },
  loadingText:    { fontSize: "16px", color: "#f48fb1", fontWeight: "500" },
  loadingDots:    { display: "flex", gap: "8px" },
  dot: {
    width: "10px", height: "10px", borderRadius: "50%",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    animation: "dotBounce 1.2s ease-in-out infinite",
    display: "inline-block",
  },

  /* NAVBAR */
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 60px", background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)", borderBottom: "1.5px solid #fce4ec",
    position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "12px",
    boxShadow: "0 2px 16px rgba(244,143,177,0.1)",
  },
  navBrand:    { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  navLogo:     { fontSize: "28px" },
  navTitle:    { fontSize: "20px", fontWeight: "700", color: "#e91e8c", letterSpacing: "0.3px" },
  navLinks:    { display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" },
  navLink: {
    textDecoration: "none", color: "#c2185b", fontSize: "14px", fontWeight: "500",
    paddingBottom: "4px", borderBottom: "2px solid transparent", transition: "color 0.2s",
  },
  navLinkActive: { color: "#e91e8c", fontWeight: "700", borderBottom: "2px solid #e91e8c" },
  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "20px", padding: "8px 20px",
    fontSize: "13px", fontWeight: "600", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  /* BREADCRUMB */
  breadcrumb: {
    display: "flex", alignItems: "center", gap: "8px", padding: "14px 60px",
    background: "linear-gradient(to right, #fff5f8, #fff)",
    borderBottom: "1px solid #fce4ec", fontSize: "13px",
  },
  breadcrumbLink:    { textDecoration: "none", color: "#f48fb1", fontWeight: "500", transition: "color 0.2s" },
  breadcrumbSep:     { color: "#f8bbd0" },
  breadcrumbCurrent: { color: "#e91e8c", fontWeight: "600" },

  /* LAYOUT */
  container: { padding: "48px 60px", maxWidth: "1200px", margin: "0 auto" },
  layout: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "64px", alignItems: "flex-start",
  },

  /* IMAGE */
  imageSection: { position: "relative" },
  imageBox: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    borderRadius: "28px", height: "440px",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", border: "2px solid #f8bbd0",
    transition: "box-shadow 0.3s ease",
  },
  image: {
    width: "100%", height: "100%", objectFit: "cover",
    borderRadius: "28px", transition: "transform 0.4s ease",
  },
  imageFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  categoryBadge: {
    position: "absolute", top: "16px", left: "16px",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", borderRadius: "20px", padding: "6px 16px",
    fontSize: "12px", fontWeight: "700", letterSpacing: "0.4px",
    boxShadow: "0 4px 14px rgba(233,30,140,0.32)", animation: "fadeInUp 0.4s ease",
  },
  stockTagIn: {
    position: "absolute", bottom: "16px", right: "16px",
    background: "#f0fff4", color: "#2e7d32", border: "1.5px solid #c8e6c9",
    borderRadius: "20px", padding: "5px 14px", fontSize: "11px", fontWeight: "700",
  },
  stockTagOut: {
    position: "absolute", bottom: "16px", right: "16px",
    background: "#fff5f5", color: "#c62828", border: "1.5px solid #ffcdd2",
    borderRadius: "20px", padding: "5px 14px", fontSize: "11px", fontWeight: "700",
  },

  /* DETAILS */
  detailsSection: { display: "flex", flexDirection: "column", gap: "20px", animation: "fadeInUp 0.5s ease" },
  productName:    { fontSize: "32px", fontWeight: "800", color: "#2d2d2d", lineHeight: "1.25", margin: 0 },

  priceRow:       { display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  price:          { fontSize: "40px", fontWeight: "800", color: "#e91e8c", lineHeight: 1 },
  freeDeliveryTag: {
    background: "#e8f5e9", color: "#2e7d32", border: "1px solid #c8e6c9",
    borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "600",
  },
  priceSub: { fontSize: "12px", color: "#aaa", margin: 0 },

  divider: {
    height: "1.5px",
    background: "linear-gradient(to right, #fce4ec, #fff5f8, #fce4ec)",
    borderRadius: "2px",
  },

  descBox: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "18px", padding: "22px", border: "1.5px solid #f8bbd0",
  },
  descTitle: {
    fontSize: "13px", fontWeight: "700", color: "#c2185b",
    margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px",
  },
  desc: { fontSize: "14px", color: "#666", lineHeight: "1.75", margin: 0 },

  highlights: { display: "flex", flexDirection: "column", gap: "10px" },
  highlight: {
    display: "flex", alignItems: "center", gap: "14px",
    background: "#fff5f8", borderRadius: "14px", padding: "13px 18px",
    border: "1.5px solid #fce4ec", transition: "background 0.2s, border-color 0.2s",
    cursor: "default",
  },
  highlightIcon:  { fontSize: "20px", flexShrink: 0 },
  highlightTitle: { fontSize: "13px", fontWeight: "700", color: "#333" },
  highlightSub:   { fontSize: "11px", color: "#aaa", marginTop: "2px" },

  /* BUTTONS */
  actions: { display: "flex", gap: "12px" },

  addToCartBtn: {
    flex: 1, background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff", border: "none", borderRadius: "16px",
    padding: "16px 24px", fontSize: "15px", fontWeight: "700",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 22px rgba(233,30,140,0.32)",
    transition: "transform 0.2s, box-shadow 0.2s, background 0.3s",
    letterSpacing: "0.3px",
  },
  goToCartBtn: {
    flex: 1, background: "linear-gradient(135deg, #43a047, #2e7d32)",
    color: "#fff", border: "none", borderRadius: "16px",
    padding: "16px 24px", fontSize: "15px", fontWeight: "700",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
    transition: "all 0.3s ease", animation: "fadeInUp 0.3s ease",
    letterSpacing: "0.3px",
  },
  wishlistBtn: {
    background: "#fff5f8", color: "#e91e8c", border: "1.5px solid #f8bbd0",
    borderRadius: "16px", padding: "16px 20px", fontSize: "20px",
    cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    transition: "all 0.2s ease", flexShrink: 0,
  },
  wishlistBtnActive: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)", color: "#e91e8c",
    border: "1.5px solid #e91e8c", borderRadius: "16px", padding: "16px 20px",
    fontSize: "20px", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.18)", flexShrink: 0,
  },
  buyNowBtn: {
    width: "100%", background: "#2d2d2d", color: "#fff",
    border: "none", borderRadius: "16px", padding: "16px",
    fontSize: "15px", fontWeight: "700", cursor: "pointer",
    fontFamily: "'Poppins', sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
    letterSpacing: "0.3px",
  },

  trustRow:   { display: "flex", flexWrap: "wrap", gap: "8px" },
  trustBadge: {
    background: "#fff5f8", color: "#c2185b", border: "1px solid #f8bbd0",
    borderRadius: "20px", padding: "5px 14px", fontSize: "11px", fontWeight: "600",
  },
  backLink: {
    textDecoration: "none", color: "#f48fb1", fontSize: "13px",
    fontWeight: "600", display: "inline-block", transition: "color 0.2s",
  },

  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "28px", fontSize: "13px", color: "#666", marginTop: "80px",
  },
};