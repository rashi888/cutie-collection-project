import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthService from "../api/AuthService";
import CartService from "../api/CartService";
import CategoryService from "../api/CategoryService";
import ProductService from "../api/ProductService";
import WishlistService from "../api/WishlistService";

import ProductCard from "../components/ProductCard";

import {
  showError,
  showSuccess,
} from "../utils/toastUtils";

const CATEGORY_ICONS = {
  "Soft Toys": "🧸",
  Stationery: "✏️",
  "Home Decor": "🏠",
  Accessories: "🎀",
  "Gift Sets": "🎁",
};

function getStoredUser() {
  const storedUser =
    localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export default function Home() {
  const [user, setUser] = useState(
    getStoredUser
  );

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [
    cartProductIds,
    setCartProductIds,
  ] = useState([]);

  const [
    wishlistProductIds,
    setWishlistProductIds,
  ] = useState([]);

  const [cartCount, setCartCount] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const isAuthenticated =
    Boolean(token);

  const isAdmin =
    user?.role === "ADMIN";

  const username =
    user?.name || "";

  const userInitial = username
    ? username
        .trim()
        .charAt(0)
        .toUpperCase()
    : "";

  const loadPublicData =
    useCallback(async () => {
      try {
        const [
          productResponse,
          categoryResponse,
        ] = await Promise.all([
          ProductService.getAll(),
          CategoryService.getAll(),
        ]);

        setProducts(
          Array.isArray(
            productResponse.data
          )
            ? productResponse.data
            : []
        );

        setCategories(
          Array.isArray(
            categoryResponse.data
          )
            ? categoryResponse.data
            : []
        );
      } catch (error) {
        setProducts([]);
        setCategories([]);

        showError(
          error,
          "Unable to load the store"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const loadCustomerData =
    useCallback(async () => {
      if (!token) {
        setUser(null);
        setCartProductIds([]);
        setWishlistProductIds([]);
        setCartCount(0);
        return;
      }

      try {
        const [
          userResponse,
          cartResponse,
          wishlistResponse,
        ] = await Promise.all([
          AuthService.getCurrentUser(),
          CartService.getCart(),
          WishlistService.getWishlist(),
        ]);

        const currentUser =
          userResponse.data;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
          })
        );

        const cartItems =
          Array.isArray(
            cartResponse.data
          )
            ? cartResponse.data
            : [];

        const wishlistItems =
          Array.isArray(
            wishlistResponse.data
          )
            ? wishlistResponse.data
            : [];

        setCartProductIds(
          cartItems.map(
            (item) => item.productId
          )
        );

        setCartCount(
          cartItems.reduce(
            (total, item) =>
              total +
              Number(
                item.quantity || 0
              ),
            0
          )
        );

        setWishlistProductIds(
          wishlistItems.map(
            (item) => item.productId
          )
        );
      } catch (error) {
        /*
         * The Axios interceptor handles
         * expired or invalid tokens.
         */
        console.error(
          "Unable to load customer data:",
          error
        );
      }
    }, [token]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const availableProducts =
        products.filter(
          (product) =>
            product.active !== false
        );

      if (!normalizedSearch) {
        return availableProducts.slice(
          0,
          8
        );
      }

      return availableProducts
        .filter((product) => {
          const productName =
            product.name
              ?.toLowerCase() || "";

          const description =
            product.description
              ?.toLowerCase() || "";

          const categoryName =
            product.categoryName
              ?.toLowerCase() || "";

          return (
            productName.includes(
              normalizedSearch
            ) ||
            description.includes(
              normalizedSearch
            ) ||
            categoryName.includes(
              normalizedSearch
            )
          );
        })
        .slice(0, 8);
    }, [products, search]);

  const handleAddToCart = async (
    product
  ) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    try {
      await CartService.addItem({
        productId: product.id,
        quantity: 1,
      });

      setCartProductIds(
        (currentIds) =>
          currentIds.includes(
            product.id
          )
            ? currentIds
            : [
                ...currentIds,
                product.id,
              ]
      );

      setCartCount(
        (currentCount) =>
          currentCount + 1
      );

      showSuccess(
        "Product added to cart"
      );
    } catch (error) {
      showError(
        error,
        "Unable to add the product to cart"
      );

      throw error;
    }
  };

  const handleWishlist = async (
    product
  ) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    const alreadyWishlisted =
      wishlistProductIds.includes(
        product.id
      );

    try {
      if (alreadyWishlisted) {
        await WishlistService
          .removeFromWishlist(
            product.id
          );

        setWishlistProductIds(
          (currentIds) =>
            currentIds.filter(
              (id) =>
                id !== product.id
            )
        );

        showSuccess(
          "Product removed from wishlist"
        );
      } else {
        await WishlistService
          .addToWishlist(
            product.id
          );

        setWishlistProductIds(
          (currentIds) => [
            ...currentIds,
            product.id,
          ]
        );

        showSuccess(
          "Product added to wishlist"
        );
      }
    } catch (error) {
      showError(
        error,
        "Unable to update the wishlist"
      );

      throw error;
    }
  };

  const handleLogout = () => {
    AuthService.logout();

    localStorage.removeItem("role");

    setUser(null);
    setCartCount(0);
    setCartProductIds([]);
    setWishlistProductIds([]);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <Link
          to="/"
          style={styles.brandLink}
        >
          <div style={styles.navBrand}>
            <span
              style={styles.navLogo}
              aria-hidden="true"
            >
              🌸
            </span>

            <span style={styles.navTitle}>
              Cutie Collection
            </span>
          </div>
        </Link>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
          >
            Home
          </Link>

          <Link
            to="/products"
            style={styles.navLink}
          >
            Shop
          </Link>

          <Link
            to="/categories"
            style={styles.navLink}
          >
            Categories
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                style={styles.navLink}
              >
                My Orders
              </Link>

              <Link
                to="/wishlist"
                style={styles.navLink}
              >
                Wishlist 💗
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/categories"
                style={styles.adminLink}
              >
                Manage Categories
              </Link>

              <Link
                to="/admin/products"
                style={styles.adminLink}
              >
                Manage Products
              </Link>

              <Link
                to="/admin/payments"
                style={styles.adminLink}
              >
                Payments
              </Link>
            </>
          )}
        </div>

        <div style={styles.navActions}>
          <div style={styles.searchBox}>
            <span aria-hidden="true">
              🔍
            </span>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              style={styles.searchInput}
              aria-label="Search products"
            />
          </div>

          {isAuthenticated && (
            <Link
              to="/cart"
              style={styles.cartLink}
              aria-label={`Cart containing ${cartCount} items`}
            >
              <span aria-hidden="true">
                🛒
              </span>

              {cartCount > 0 && (
                <span
                  style={styles.cartBadge}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div style={styles.userSection}>
              <div style={styles.userAvatar}>
                {userInitial}
              </div>

              <span style={styles.userName}>
                {username}
              </span>
            </div>
          ) : (
            <Link
              to="/login"
              style={styles.loginButton}
            >
              Login
            </Link>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div
          style={styles.heroBlobOne}
          aria-hidden="true"
        />

        <div
          style={styles.heroBlobTwo}
          aria-hidden="true"
        />

        <div style={styles.heroContent}>
          <span style={styles.heroBadge}>
            ✨ Discover our latest products
          </span>

          <h1 style={styles.heroTitle}>
            Shop Cute,
            <br />

            <span style={styles.heroAccent}>
              Feel Cuter 🌸
            </span>
          </h1>

          <p style={styles.heroSubtitle}>
            Discover adorable products,
            thoughtful gifts, stationery,
            accessories, and home decor.
          </p>

          <div style={styles.heroButtons}>
            <Link
              to="/products"
              style={styles.primaryLink}
            >
              Shop Now 🛍️
            </Link>

            <Link
              to="/categories"
              style={styles.secondaryLink}
            >
              Browse Categories
            </Link>
          </div>
        </div>

        <div style={styles.heroVisual}>
          <span
            style={styles.heroEmoji}
            aria-hidden="true"
          >
            🛍️
          </span>

          <span
            style={styles.floatingBadge}
          >
            🌸 Cutie Picks
          </span>
        </div>
      </section>

      {/* Categories */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Shop by Category 💝
        </h2>

        <p style={styles.sectionSubtitle}>
          Find products from our active
          collections.
        </p>

        {categories.length > 0 ? (
          <div style={styles.categoryGrid}>
            {categories
              .slice(0, 6)
              .map((category) => (
                <Link
                  key={category.id}
                  to={`/products?categoryId=${category.id}`}
                  style={styles.categoryLink}
                >
                  <article
                    style={
                      styles.categoryCard
                    }
                  >
                    <span
                      style={
                        styles.categoryEmoji
                      }
                      aria-hidden="true"
                    >
                      {CATEGORY_ICONS[
                        category.name
                      ] || "🏷️"}
                    </span>

                    <span
                      style={
                        styles.categoryName
                      }
                    >
                      {category.name}
                    </span>
                  </article>
                </Link>
              ))}
          </div>
        ) : (
          !loading && (
            <p style={styles.emptyMessage}>
              No categories are currently
              available.
            </p>
          )
        )}
      </section>

      {/* Products */}
      <section
        style={{
          ...styles.section,
          background: "#fff0f5",
        }}
      >
        <h2 style={styles.sectionTitle}>
          Cutie Picks 🌷
        </h2>

        <p style={styles.sectionSubtitle}>
          Browse products selected from the
          current catalogue.
        </p>

        {loading ? (
          <div
            style={styles.loadingContainer}
            role="status"
          >
            <span
              style={styles.loadingIcon}
              aria-hidden="true"
            >
              🌸
            </span>

            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div style={styles.productGrid}>
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={
                    handleAddToCart
                  }
                  onAddToWishlist={
                    handleWishlist
                  }
                  isInCart={cartProductIds.includes(
                    product.id
                  )}
                  isInWishlist={wishlistProductIds.includes(
                    product.id
                  )}
                />
              )
            )}
          </div>
        ) : (
          <div style={styles.emptyMessage}>
            {search
              ? "No products match your search."
              : "No products are currently available."}
          </div>
        )}

        <div style={styles.centeredAction}>
          <Link
            to="/products"
            style={styles.primaryLink}
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Store information */}
      <section style={styles.infoBanner}>
        <div>
          <h2 style={styles.infoBannerTitle}>
            Secure and simple shopping
          </h2>

          <p
            style={
              styles.infoBannerText
            }
          >
            Browse products publicly, sign
            in to manage your cart and
            wishlist, and complete payments
            securely through Razorpay.
          </p>
        </div>

        <Link
          to={
            isAuthenticated
              ? "/cart"
              : "/signup"
          }
          style={styles.bannerLink}
        >
          {isAuthenticated
            ? "View Cart"
            : "Create Account"}
        </Link>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <p style={styles.footerBrand}>
              🌸 Cutie Collection
            </p>

            <p
              style={
                styles.footerDescription
              }
            >
              Your one-stop shop for cute
              products and thoughtful gifts.
            </p>
          </div>

          <div style={styles.footerLinks}>
            <Link
              to="/"
              style={styles.footerLink}
            >
              Home
            </Link>

            <Link
              to="/products"
              style={styles.footerLink}
            >
              Products
            </Link>

            <Link
              to="/categories"
              style={styles.footerLink}
            >
              Categories
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  style={styles.footerLink}
                >
                  Cart
                </Link>

                <Link
                  to="/wishlist"
                  style={styles.footerLink}
                >
                  Wishlist
                </Link>

                <Link
                  to="/orders"
                  style={styles.footerLink}
                >
                  Orders
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={styles.footerBottom}>
          © {new Date().getFullYear()} Cutie
          Collection. Made with 💕 for all
          cuties.
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    overflowX: "hidden",
    background: "#ffffff",
    color: "#333333",
    fontFamily: "'Poppins', sans-serif",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 4%",
    borderBottom: "1.5px solid #fce4ec",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
  },

  brandLink: {
    textDecoration: "none",
  },

  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navLogo: {
    fontSize: "28px",
  },

  navTitle: {
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "700",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },

  navLink: {
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  adminLink: {
    color: "#7b1fa2",
    fontSize: "12px",
    fontWeight: "700",
    textDecoration: "none",
  },

  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#fff5f8",
  },

  searchInput: {
    width: "145px",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#444444",
    fontFamily: "inherit",
    fontSize: "12px",
  },

  cartLink: {
    position: "relative",
    display: "flex",
    width: "40px",
    height: "40px",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #f8bbd0",
    borderRadius: "50%",
    background: "#fff5f8",
    fontSize: "18px",
    textDecoration: "none",
  },

  cartBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    display: "flex",
    minWidth: "18px",
    height: "18px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: "#e91e8c",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: "700",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  userAvatar: {
    display: "flex",
    width: "38px",
    height: "38px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontWeight: "700",
  },

  userName: {
    color: "#a81750",
    fontSize: "12px",
    fontWeight: "600",
  },

  loginButton: {
    padding: "8px 20px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },

  logoutButton: {
    padding: "8px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#fff5f8",
    color: "#a81750",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "600",
  },

  hero: {
    position: "relative",
    display: "flex",
    minHeight: "500px",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "40px",
    padding: "70px 6%",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    flexWrap: "wrap",
  },

  heroBlobOne: {
    position: "absolute",
    top: "-100px",
    right: "180px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #f8bbd0, #f48fb1)",
    opacity: 0.2,
    filter: "blur(60px)",
  },

  heroBlobTwo: {
    position: "absolute",
    bottom: "-80px",
    left: "-80px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #fce4ec, #f8bbd0)",
    opacity: 0.3,
    filter: "blur(50px)",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "560px",
  },

  heroBadge: {
    display: "inline-block",
    marginBottom: "20px",
    padding: "6px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "600",
  },

  heroTitle: {
    margin: "0 0 16px",
    color: "#2d2d2d",
    fontSize: "clamp(40px, 7vw, 56px)",
    fontWeight: "800",
    lineHeight: 1.15,
  },

  heroAccent: {
    color: "#e91e8c",
  },

  heroSubtitle: {
    margin: "0 0 30px",
    color: "#777777",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  heroButtons: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },

  primaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 25px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 6px 20px rgba(233,30,140,0.25)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    textDecoration: "none",
  },

  secondaryLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    border: "2px solid #f8bbd0",
    borderRadius: "14px",
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "700",
    textDecoration: "none",
  },

  heroVisual: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    width: "260px",
    height: "260px",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #f8bbd0",
    borderRadius: "36px",
    background: "rgba(255,255,255,0.75)",
    boxShadow:
      "0 20px 50px rgba(244,143,177,0.2)",
  },

  heroEmoji: {
    fontSize: "110px",
  },

  floatingBadge: {
    position: "absolute",
    right: "-15px",
    top: "20px",
    padding: "6px 14px",
    borderRadius: "20px",
    background: "#e91e8c",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
  },

  section: {
    padding: "70px 6%",
    background: "#ffffff",
  },

  sectionTitle: {
    margin: "0 0 8px",
    color: "#e91e8c",
    fontSize: "30px",
    fontWeight: "700",
    textAlign: "center",
  },

  sectionSubtitle: {
    margin: "0 0 42px",
    color: "#777777",
    fontSize: "14px",
    textAlign: "center",
  },

  categoryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(145px, 1fr))",
    gap: "20px",
  },

  categoryLink: {
    color: "inherit",
    textDecoration: "none",
  },

  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "28px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  categoryEmoji: {
    fontSize: "36px",
  },

  categoryName: {
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "700",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(225px, 1fr))",
    gap: "24px",
  },

  loadingContainer: {
    padding: "50px 20px",
    color: "#a81750",
    textAlign: "center",
  },

  loadingIcon: {
    display: "block",
    marginBottom: "10px",
    fontSize: "44px",
  },

  emptyMessage: {
    padding: "30px",
    color: "#9f5575",
    textAlign: "center",
  },

  centeredAction: {
    marginTop: "38px",
    textAlign: "center",
  },

  infoBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "28px",
    padding: "48px 7%",
    background:
      "linear-gradient(135deg, #e91e8c, #f06292)",
    color: "#ffffff",
    flexWrap: "wrap",
  },

  infoBannerTitle: {
    margin: "0 0 8px",
    fontSize: "27px",
    fontWeight: "700",
  },

  infoBannerText: {
    maxWidth: "700px",
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  bannerLink: {
    padding: "12px 24px",
    borderRadius: "13px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "700",
    textDecoration: "none",
  },

  footer: {
    padding: "50px 6% 0",
    background: "#2d2d2d",
    color: "#cccccc",
  },

  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    gap: "36px",
    paddingBottom: "36px",
    flexWrap: "wrap",
  },

  footerBrand: {
    margin: "0 0 8px",
    color: "#f48fb1",
    fontSize: "20px",
    fontWeight: "700",
  },

  footerDescription: {
    maxWidth: "360px",
    margin: 0,
    color: "#999999",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  footerLinks: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  footerLink: {
    color: "#bbbbbb",
    fontSize: "12px",
    textDecoration: "none",
  },

  footerBottom: {
    padding: "20px 0",
    borderTop: "1px solid #444444",
    color: "#888888",
    fontSize: "12px",
    textAlign: "center",
  },
};