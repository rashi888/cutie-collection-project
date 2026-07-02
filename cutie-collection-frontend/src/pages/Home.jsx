import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

const categories = [
  { name: "Accessories", emoji: "💍" },
  { name: "Skincare", emoji: "🧴" },
  { name: "Stationery", emoji: "✏️" },
  { name: "Hair Care", emoji: "🎀" },
  { name: "Fragrance", emoji: "🌹" },
  { name: "Home Decor", emoji: "🏠" },
];

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);

  const username = user?.name || "";
  const initial = username ? username.charAt(0).toUpperCase() : "";

  const navigate = useNavigate();

  // ── Fetch current user ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get("/api/user/me")
      .then((r) => setUser(r.data))
      .catch(console.error);
  }, []);

  // ── Fetch products from API ─────────────────────────────────────────
  useEffect(() => {
    api
      .get("/api/products")
      .then((r) => setProducts(r.data))
      .catch(console.error);
  }, []);

  // ── Fetch cart count ────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/api/cart")
      .then((r) => {
        setCartCount(r.data.length);
        setCartProducts(
          r.data.map((item) => item.productId || item.product?.id),
        );
      })
      .catch(console.error);
  }, []);

  // ── Fetch wishlist ──────────────────────────────────────────────────
  useEffect(() => {
    api
      .get("/api/wishlist")
      .then((r) =>
        setWishlist(r.data.map((item) => item.product?.id ?? item.id)),
      )
      .catch(console.error);
  }, []);

  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/api/wishlist/remove/${productId}`);
        setWishlist((prev) => prev.filter((i) => i !== productId));
      } else {
        await api.post(`/api/wishlist/add/${productId}`);
        setWishlist((prev) => [...prev, productId]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = async (product) => {
    try {
      await api.post("/api/cart/add", {
        productId: product.id,
        quantity: 1,
      });

      setCartCount((c) => c + 1);

      setCartProducts((prev) => [...prev, product.id]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

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
          <Link to="/" style={styles.navLink}>
            Home
          </Link>
          <Link to="/products" style={styles.navLink}>
            Shop
          </Link>
          <Link to="/categories" style={styles.navLink}>
            Categories
          </Link>
          <Link to="/orders" style={styles.navLink}>
            My Orders
          </Link>
          <Link to="/wishlist" style={styles.navLink}>
            Wishlist 💗
          </Link>
          {user?.role === "ADMIN" && (
            <>
              <Link
                to="/manage-categories"
                style={{ ...styles.navLink, color: "#9c27b0" }}
              >
                Manage Categories
              </Link>
              <Link
                to="/manage-products"
                style={{ ...styles.navLink, color: "#9c27b0" }}
              >
                Manage Products
              </Link>
            </>
          )}
        </div>

        <div style={styles.navActions}>
          <div style={styles.searchBox}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search cuties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <Link to="/cart" style={{ textDecoration: "none" }}>
            <button style={styles.cartBtn}>
              🛒
              {cartCount > 0 && (
                <span style={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </Link>

          {user ? (
            <div style={styles.userSection}>
              <div style={styles.userAvatar}>{initial}</div>
              <span style={styles.userName}>{username}</span>
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}>
              Login
            </Link>
          )}

          <button onClick={handleLogout} style={styles.logoutBtn}>
            🌸 Logout
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroBlob1} />
        <div style={styles.heroBlob2} />
        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>✨ New Arrivals Just Dropped!</span>
          <h1 style={styles.heroTitle}>
            Shop Cute,
            <br />
            <span style={styles.heroAccent}>Feel Cuter 🌸</span>
          </h1>
          <p style={styles.heroSub}>
            Discover handpicked adorable collections just for you 💕
          </p>
          <div style={styles.heroBtns}>
            <Link to="/products" style={{ textDecoration: "none" }}>
              <button style={styles.heroBtn}>Shop Now 🛍️</button>
            </Link>
            <Link to="/categories" style={{ textDecoration: "none" }}>
              <button style={styles.heroBtnOutline}>
                Browse Categories 💖
              </button>
            </Link>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <strong>500+</strong>
              <span>Products</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <strong>10k+</strong>
              <span>Cuties</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <strong>4.9★</strong>
              <span>Rating</span>
            </div>
          </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.heroImageCard}>
            <span style={{ fontSize: "120px" }}>🛍️</span>
            <div style={styles.floatingBadge1}>🌸 New!</div>
            <div style={styles.floatingBadge2}>💕 Trending</div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Shop by Category 💝</h2>
        <p style={styles.sectionSub}>Find your favourite cutie picks</p>
        <div style={styles.categoryGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              style={{ textDecoration: "none" }}
            >
              <div style={styles.categoryCard}>
                <span style={styles.categoryEmoji}>{cat.emoji}</span>
                <span style={styles.categoryName}>{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section style={{ ...styles.section, background: "#fff0f5" }}>
        <h2 style={styles.sectionTitle}>Cutie Picks 🌷</h2>
        <p style={styles.sectionSub}>Handpicked just for you</p>
        <div style={styles.productGrid}>
          {filtered.map((product) => (
            <div
              key={product.id}
              style={styles.productCard}
              onClick={() =>
                navigate("/products", {
                  state: { productId: product.id },
                })
              }
            >
              {product.tag && (
                <span style={styles.productTag}>{product.tag}</span>
              )}
              <button
                style={styles.wishlistBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
              >
                {wishlist.includes(product.id) ? "❤️" : "🤍"}
              </button>
              <Link
                to={`/products`}
                state={{ productId: product.id }}
                style={{ textDecoration: "none" }}
              >
                <div style={styles.productEmoji}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    "🛍️"
                  )}
                </div>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productPrice}>
                  ₹{product.price ?? product.price}
                </p>
              </Link>
              {cartProducts.includes(product.id) ? (
                <button
                  style={styles.addToCartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/cart");
                  }}
                >
                  Go To Cart 🛒
                </button>
              ) : (
                <button
                  style={styles.addToCartBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  Add To Cart 🛒
                </button>
              )}
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p style={styles.noResult}>
            {products.length === 0
              ? "Loading cuties... 🌸"
              : "No cuties found 😢 Try a different search!"}
          </p>
        )}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link to="/products" style={{ textDecoration: "none" }}>
            <button style={styles.heroBtn}>View All Products 🛍️</button>
          </Link>
        </div>
      </section>

      {/* ── BANNER ── */}
      <section style={styles.banner}>
        <div style={styles.bannerBlob} />
        <div style={styles.bannerContent}>
          <h2 style={styles.bannerTitle}>Get 20% OFF your first order! 🎉</h2>
          <p style={styles.bannerSub}>
            Use code <strong>CUTIE20</strong> at checkout 💕
          </p>
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <button style={styles.bannerBtn}>Claim Offer 🌸</button>
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What Cuties Say 💬</h2>
        <p style={styles.sectionSub}>Real love from our community</p>
        <div style={styles.testimonialsGrid}>
          {[
            {
              name: "Mia 🌸",
              text: "Absolutely love this shop! Everything is so adorable and the packaging is super cute!",
              stars: "⭐⭐⭐⭐⭐",
            },
            {
              name: "Sophie 💕",
              text: "Best online shopping experience! My order arrived so fast and everything was perfect.",
              stars: "⭐⭐⭐⭐⭐",
            },
            {
              name: "Zoe 🎀",
              text: "The hair clips set is my fave purchase ever! Will definitely be ordering again soon!",
              stars: "⭐⭐⭐⭐⭐",
            },
          ].map((t) => (
            <div key={t.name} style={styles.testimonialCard}>
              <p style={styles.testimonialStars}>{t.stars}</p>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <p style={styles.testimonialName}>— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={styles.newsletter}>
        <h2 style={styles.newsletterTitle}>Stay Cute, Stay Updated 🌸</h2>
        <p style={styles.newsletterSub}>
          Subscribe for new arrivals &amp; exclusive deals!
        </p>
        <div style={styles.newsletterForm}>
          <input
            type="email"
            placeholder="Enter your email 💌"
            style={styles.newsletterInput}
          />
          <button style={styles.newsletterBtn}>Subscribe ✨</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div>
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={styles.footerBrand}>🌸 Cutie Collection</div>
            </Link>
            <p style={styles.footerTagline}>
              Your one-stop shop for all things cute 💕
            </p>
          </div>
          <div style={styles.footerLinks}>
            <span style={styles.footerLinkTitle}>Quick Links</span>
            <Link to="/" style={styles.footerLink}>
              Home
            </Link>
            <Link to="/products" style={styles.footerLink}>
              Shop
            </Link>
            <Link to="/categories" style={styles.footerLink}>
              Categories
            </Link>
            <Link to="/orders" style={styles.footerLink}>
              My Orders
            </Link>
          </div>
          <div style={styles.footerLinks}>
            <span style={styles.footerLinkTitle}>Account</span>
            <Link to="/cart" style={styles.footerLink}>
              My Cart 🛒
            </Link>
            <Link to="/wishlist" style={styles.footerLink}>
              Wishlist 💗
            </Link>
            <Link to="/checkout" style={styles.footerLink}>
              Checkout
            </Link>
            <Link to="/login" style={styles.footerLink}>
              Login / Signup
            </Link>
          </div>
          <div style={styles.footerLinks}>
            <span style={styles.footerLinkTitle}>Follow Us</span>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              style={styles.footerLink}
            >
              Instagram 📸
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer"
              style={styles.footerLink}
            >
              Pinterest 📌
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              style={styles.footerLink}
            >
              TikTok 🎵
            </a>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2024 Cutie Collection. Made with 💕 for all cuties.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    color: "#333",
    overflowX: "hidden",
  },
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
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  navLogo: { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: { display: "flex", gap: "20px", flexWrap: "wrap" },
  navLink: {
    textDecoration: "none",
    color: "#c2185b",
    fontSize: "14px",
    fontWeight: "500",
  },
  navActions: { display: "flex", alignItems: "center", gap: "14px" },
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
  cartBtn: {
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "18px",
    cursor: "pointer",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    background: "#e91e8c",
    color: "#fff",
    borderRadius: "50%",
    width: "18px",
    height: "18px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userSection: { display: "flex", alignItems: "center", gap: "10px" },
  userAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 4px 12px rgba(233,30,140,0.3)",
    cursor: "pointer",
  },
  userName: { color: "#c2185b", fontSize: "14px", fontWeight: "600" },
  loginBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "'Poppins', sans-serif",
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
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "80px 60px",
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    position: "relative",
    overflow: "hidden",
    flexWrap: "wrap",
    gap: "40px",
    minHeight: "520px",
  },
  heroBlob1: {
    position: "absolute",
    top: "-100px",
    right: "200px",
    width: "350px",
    height: "350px",
    background: "radial-gradient(circle, #f8bbd0, #f48fb1)",
    borderRadius: "50%",
    opacity: 0.2,
    filter: "blur(60px)",
  },
  heroBlob2: {
    position: "absolute",
    bottom: "-80px",
    left: "-80px",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, #fce4ec, #f8bbd0)",
    borderRadius: "50%",
    opacity: 0.3,
    filter: "blur(50px)",
  },
  heroContent: { maxWidth: "520px", position: "relative", zIndex: 1 },
  heroBadge: {
    background: "#fff",
    color: "#e91e8c",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "52px",
    fontWeight: "800",
    color: "#2d2d2d",
    lineHeight: "1.15",
    marginBottom: "16px",
  },
  heroAccent: { color: "#e91e8c" },
  heroSub: {
    fontSize: "16px",
    color: "#888",
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  heroBtns: {
    display: "flex",
    gap: "16px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  heroBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
    fontFamily: "'Poppins', sans-serif",
  },
  heroBtnOutline: {
    background: "transparent",
    color: "#e91e8c",
    border: "2px solid #f8bbd0",
    borderRadius: "14px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  heroStats: { display: "flex", alignItems: "center", gap: "20px" },
  stat: {
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    color: "#888",
  },
  statDivider: { width: "1px", height: "30px", background: "#f8bbd0" },
  heroImage: { position: "relative", zIndex: 1 },
  heroImageCard: {
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(20px)",
    borderRadius: "32px",
    padding: "48px",
    border: "2px solid rgba(248,187,208,0.5)",
    boxShadow: "0 20px 60px rgba(244,143,177,0.2)",
    textAlign: "center",
    position: "relative",
  },
  floatingBadge1: {
    position: "absolute",
    top: "16px",
    right: "-16px",
    background: "#e91e8c",
    color: "#fff",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(233,30,140,0.3)",
  },
  floatingBadge2: {
    position: "absolute",
    bottom: "16px",
    left: "-16px",
    background: "#fff",
    color: "#e91e8c",
    border: "2px solid #f8bbd0",
    borderRadius: "20px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600",
  },
  section: { padding: "80px 60px", background: "#fff" },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#e91e8c",
    textAlign: "center",
    marginBottom: "8px",
  },
  sectionSub: {
    fontSize: "15px",
    color: "#aaa",
    textAlign: "center",
    marginBottom: "48px",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "20px",
  },
  categoryCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "20px",
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    border: "1.5px solid #f8bbd0",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  categoryEmoji: { fontSize: "36px" },
  categoryName: { fontSize: "13px", fontWeight: "600", color: "#c2185b" },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "24px",
  },
  productCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    border: "1.5px solid #f8bbd0",
    position: "relative",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(244,143,177,0.1)",
    transition: "transform 0.2s",
  },
  productTag: {
    position: "absolute",
    top: "14px",
    left: "14px",
    background: "#e91e8c",
    color: "#fff",
    borderRadius: "10px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "600",
  },
  wishlistBtn: {
    position: "absolute",
    top: "12px",
    right: "14px",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  productEmoji: { fontSize: "56px", marginBottom: "12px" },
  productName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "6px",
  },
  productPrice: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#e91e8c",
    marginBottom: "16px",
  },
  addToCartBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    width: "100%",
  },
  noResult: { textAlign: "center", color: "#f48fb1", fontSize: "16px" },
  banner: {
    background: "linear-gradient(135deg, #e91e8c, #f06292)",
    padding: "60px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  bannerBlob: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "250px",
    height: "250px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
  },
  bannerContent: { position: "relative", zIndex: 1 },
  bannerTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "10px",
  },
  bannerSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "28px",
  },
  bannerBtn: {
    background: "#fff",
    color: "#e91e8c",
    border: "none",
    borderRadius: "14px",
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  testimonialCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "20px",
    padding: "28px",
    border: "1.5px solid #f8bbd0",
  },
  testimonialStars: { fontSize: "16px", marginBottom: "12px" },
  testimonialText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.7",
    marginBottom: "16px",
  },
  testimonialName: { fontSize: "13px", fontWeight: "600", color: "#e91e8c" },
  newsletter: {
    background: "#fff5f8",
    padding: "70px 60px",
    textAlign: "center",
    borderTop: "1.5px solid #fce4ec",
  },
  newsletterTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#e91e8c",
    marginBottom: "8px",
  },
  newsletterSub: { fontSize: "15px", color: "#aaa", marginBottom: "32px" },
  newsletterForm: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  newsletterInput: {
    padding: "14px 20px",
    borderRadius: "14px",
    border: "1.5px solid #f8bbd0",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    width: "300px",
    color: "#444",
  },
  newsletterBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
  footer: { background: "#2d2d2d", padding: "60px 60px 0", color: "#ccc" },
  footerTop: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "40px",
    paddingBottom: "48px",
    borderBottom: "1px solid #444",
  },
  footerBrand: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#f48fb1",
    marginBottom: "10px",
  },
  footerTagline: { fontSize: "13px", color: "#888", lineHeight: "1.6" },
  footerLinks: { display: "flex", flexDirection: "column", gap: "10px" },
  footerLinkTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f48fb1",
    marginBottom: "4px",
  },
  footerLink: { fontSize: "13px", color: "#999", textDecoration: "none" },
  footerBottom: {
    textAlign: "center",
    padding: "20px 0",
    fontSize: "13px",
    color: "#666",
  },
};
