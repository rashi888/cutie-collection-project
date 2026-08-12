import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import CategoryService from "../api/CategoryService";

import {
  showError,
} from "../utils/toastUtils";

const CATEGORY_ICONS = {
  "Soft Toys": "🧸",
  Stationery: "✏️",
  "Home Decor": "🏠",
  Accessories: "🎀",
  "Gift Sets": "🎁",
};

export default function CategoryPage() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const navigate = useNavigate();

  const isAuthenticated = Boolean(
    localStorage.getItem("token")
  );

  const fetchCategories =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await CategoryService.getAll();

        setCategories(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        setCategories([]);

        showError(
          error,
          "Unable to load categories"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });
  };

  const getCategoryIcon = (
    categoryName
  ) => {
    return (
      CATEGORY_ICONS[categoryName] ||
      "🏷️"
    );
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
            Products
          </Link>

          <Link
            to="/categories"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            Categories
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/wishlist"
                style={styles.navLink}
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                style={styles.navLink}
              >
                Cart
              </Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            🌸 Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={styles.loginLink}
          >
            Login
          </Link>
        )}
      </nav>

      {/* Page header */}
      <header style={styles.header}>
        <div
          style={styles.blobOne}
          aria-hidden="true"
        />

        <div
          style={styles.blobTwo}
          aria-hidden="true"
        />

        <div style={styles.headerContent}>
          <span style={styles.headerBadge}>
            ✨ Browse Our Collections
          </span>

          <h1 style={styles.title}>
            Shop by{" "}
            <span style={styles.accent}>
              Category 💝
            </span>
          </h1>

          <p style={styles.subtitle}>
            Find your favourite cutie picks
            from our active collections.
          </p>
        </div>
      </header>

      {/* Category content */}
      <main style={styles.container}>
        {loading ? (
          <div
            style={styles.loadingBox}
            role="status"
            aria-live="polite"
          >
            <span
              style={styles.loadingIcon}
              aria-hidden="true"
            >
              🌸
            </span>

            <p style={styles.loadingText}>
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyBox}>
            <span
              style={styles.emptyIcon}
              aria-hidden="true"
            >
              🛍️
            </span>

            <p style={styles.emptyTitle}>
              No categories available
            </p>

            <p style={styles.emptyText}>
              Check back soon for new
              collections.
            </p>

            <Link
              to="/products"
              style={styles.primaryLink}
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  Explore Collections
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Select a category to view
                  its available products.
                </p>
              </div>

              <span style={styles.countBadge}>
                {categories.length}{" "}
                {categories.length === 1
                  ? "category"
                  : "categories"}
              </span>
            </div>

            <div style={styles.grid}>
              {categories.map(
                (category) => (
                  <article
                    key={category.id}
                    style={styles.card}
                  >
                    <span
                      style={styles.cardEmoji}
                      aria-hidden="true"
                    >
                      {getCategoryIcon(
                        category.name
                      )}
                    </span>

                    <h3
                      style={styles.cardName}
                    >
                      {category.name}
                    </h3>

                    <p
                      style={
                        styles.cardDescription
                      }
                    >
                      {category.description ||
                        "Discover cute products from this collection."}
                    </p>

                    <Link
                      to={`/products?categoryId=${category.id}`}
                      style={styles.shopLink}
                      aria-label={`Browse products in ${category.name}`}
                    >
                      Shop Now 🛍️
                    </Link>
                  </article>
                )
              )}
            </div>

            <div
              style={
                styles.allProductsSection
              }
            >
              <div>
                <h2
                  style={
                    styles.allProductsTitle
                  }
                >
                  Looking for everything?
                </h2>

                <p
                  style={
                    styles.allProductsText
                  }
                >
                  Browse the complete product
                  collection in one place.
                </p>
              </div>

              <Link
                to="/products"
                style={styles.primaryLink}
              >
                View All Products
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>
          © {new Date().getFullYear()} Cutie
          Collection. Made with 💕 for all
          cuties.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
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
    padding: "16px 5%",
    borderBottom: "1.5px solid #fce4ec",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
  },

  brandLink: {
    color: "inherit",
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
    gap: "24px",
    flexWrap: "wrap",
  },

  navLink: {
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  activeNavLink: {
    color: "#e91e8c",
    fontWeight: "700",
  },

  logoutButton: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 4px 12px rgba(233,30,140,0.25)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  loginLink: {
    padding: "8px 20px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 4px 12px rgba(233,30,140,0.25)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },

  header: {
    position: "relative",
    padding: "60px 5% 50px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
  },

  blobOne: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #f8bbd0, #f48fb1)",
    opacity: 0.25,
    filter: "blur(50px)",
  },

  blobTwo: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #fce4ec, #f8bbd0)",
    opacity: 0.3,
    filter: "blur(40px)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
  },

  headerBadge: {
    display: "inline-block",
    marginBottom: "16px",
    padding: "6px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "600",
  },

  title: {
    margin: "0 0 10px",
    color: "#2d2d2d",
    fontSize: "clamp(32px, 6vw, 40px)",
    fontWeight: "800",
  },

  accent: {
    color: "#e91e8c",
  },

  subtitle: {
    margin: 0,
    color: "#777777",
    fontSize: "15px",
  },

  container: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "46px 0 70px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    margin: "0 0 6px",
    color: "#333333",
    fontSize: "26px",
    fontWeight: "700",
  },

  sectionSubtitle: {
    margin: 0,
    color: "#777777",
    fontSize: "13px",
  },

  countBadge: {
    padding: "6px 13px",
    border: "1px solid #f8bbd0",
    borderRadius: "999px",
    background: "#fff5f8",
    color: "#a81750",
    fontSize: "11px",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
  },

  card: {
    display: "flex",
    minHeight: "245px",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "28px 20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
    boxShadow:
      "0 4px 20px rgba(244,143,177,0.1)",
    textAlign: "center",
  },

  cardEmoji: {
    fontSize: "42px",
  },

  cardName: {
    margin: "5px 0 0",
    color: "#333333",
    fontSize: "16px",
    fontWeight: "700",
  },

  cardDescription: {
    display: "-webkit-box",
    minHeight: "58px",
    margin: 0,
    overflow: "hidden",
    color: "#777777",
    fontSize: "12px",
    lineHeight: "1.6",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
  },

  shopLink: {
    marginTop: "auto",
    padding: "9px 20px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 4px 12px rgba(233,30,140,0.25)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    textDecoration: "none",
  },

  loadingBox: {
    padding: "80px 20px",
    textAlign: "center",
  },

  loadingIcon: {
    display: "block",
    fontSize: "48px",
  },

  loadingText: {
    marginTop: "16px",
    color: "#c85f89",
    fontSize: "16px",
  },

  emptyBox: {
    padding: "60px 20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
    textAlign: "center",
  },

  emptyIcon: {
    display: "block",
    fontSize: "64px",
  },

  emptyTitle: {
    margin: "16px 0 6px",
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "700",
  },

  emptyText: {
    margin: "0 0 24px",
    color: "#9f5575",
    fontSize: "14px",
  },

  primaryLink: {
    display: "inline-flex",
    padding: "11px 22px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    textDecoration: "none",
  },

  allProductsSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    marginTop: "42px",
    padding: "26px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#fffafd",
    flexWrap: "wrap",
  },

  allProductsTitle: {
    margin: "0 0 5px",
    color: "#a81750",
    fontSize: "19px",
    fontWeight: "700",
  },

  allProductsText: {
    margin: 0,
    color: "#777777",
    fontSize: "12px",
  },

  footer: {
    marginTop: "60px",
    padding: "24px",
    background: "#2d2d2d",
    color: "#999999",
    fontSize: "13px",
    textAlign: "center",
  },
};