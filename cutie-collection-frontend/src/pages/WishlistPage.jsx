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

import CartService from "../api/CartService";
import WishlistService from "../api/WishlistService";

import WishlistCard from "../components/WishlistCard";

import {
  showError,
  showSuccess,
} from "../utils/toastUtils";

export default function WishlistPage() {
  const [wishlist, setWishlist] =
    useState([]);

  const [
    cartProductIds,
    setCartProductIds,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [clearing, setClearing] =
    useState(false);

  const navigate = useNavigate();

  const fetchWishlistData =
    useCallback(async () => {
      try {
        setLoading(true);

        const [
          wishlistResponse,
          cartResponse,
        ] = await Promise.all([
          WishlistService.getWishlist(),
          CartService.getCart(),
        ]);

        const wishlistItems =
          Array.isArray(
            wishlistResponse.data
          )
            ? wishlistResponse.data
            : [];

        const cartItems =
          Array.isArray(
            cartResponse.data
          )
            ? cartResponse.data
            : [];

        setWishlist(wishlistItems);

        setCartProductIds(
          cartItems.map((item) =>
            Number(item.productId)
          )
        );
      } catch (error) {
        setWishlist([]);
        setCartProductIds([]);

        showError(
          error,
          "Unable to load your wishlist"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const availableItemsCount = useMemo(
    () =>
      wishlist.filter((item) => {
        const productInactive =
          item.productActive === false ||
          item.active === false;

        const stockQuantity = Number(
          item.stockQuantity ??
            item.availableStock ??
            0
        );

        return (
          !productInactive &&
          stockQuantity > 0
        );
      }).length,
    [wishlist]
  );

  const handleRemove = async (
    productId
  ) => {
    const normalizedProductId =
      Number(productId);

    try {
      await WishlistService
        .removeFromWishlist(
          normalizedProductId
        );

      setWishlist((currentItems) =>
        currentItems.filter(
          (item) =>
            Number(item.productId) !==
            normalizedProductId
        )
      );

      showSuccess(
        "Product removed from wishlist"
      );
    } catch (error) {
      showError(
        error,
        "Unable to remove the product from your wishlist"
      );

      /*
       * WishlistCard catches this error and
       * restores the card's visual state.
       */
      throw error;
    }
  };

  const handleAddToCart = async (
    item
  ) => {
    const productId = Number(
      item.productId
    );

    if (
      cartProductIds.includes(productId)
    ) {
      navigate("/cart");
      return;
    }

    try {
      await CartService.addItem({
        productId,
        quantity: 1,
      });

      setCartProductIds(
        (currentProductIds) =>
          currentProductIds.includes(
            productId
          )
            ? currentProductIds
            : [
                ...currentProductIds,
                productId,
              ]
      );

      showSuccess(
        `${
          item.productName || "Product"
        } added to cart`
      );
    } catch (error) {
      showError(
        error,
        "Unable to add the product to your cart"
      );

      /*
       * WishlistCard uses finally to end its
       * loading state after this error.
       */
      throw error;
    }
  };

  const handleClearWishlist =
    async () => {
      if (
        clearing ||
        wishlist.length === 0
      ) {
        return;
      }

      const confirmed = window.confirm(
        "Remove all products from your wishlist?"
      );

      if (!confirmed) {
        return;
      }

      try {
        setClearing(true);

        await WishlistService
          .clearWishlist();

        setWishlist([]);

        showSuccess(
          "Wishlist cleared successfully"
        );
      } catch (error) {
        showError(
          error,
          "Unable to clear your wishlist"
        );
      } finally {
        setClearing(false);
      }
    };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    /*
     * Remove values created by the older
     * frontend authentication structure.
     */
    localStorage.removeItem("role");
    localStorage.removeItem(
      "username"
    );

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
            Products
          </Link>

          <Link
            to="/categories"
            style={styles.navLink}
          >
            Categories
          </Link>

          <Link
            to="/cart"
            style={styles.navLink}
          >
            🛒 Cart
          </Link>

          <Link
            to="/wishlist"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            💖 Wishlist
          </Link>

          <Link
            to="/orders"
            style={styles.navLink}
          >
            📦 Orders
          </Link>
        </div>

        <button
          type="button"
          style={styles.logoutButton}
          onClick={handleLogout}
        >
          🌸 Logout
        </button>
      </nav>

      {/* Header */}
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
          <span
            style={styles.headerBadge}
          >
            💖 My Wishlist
          </span>

          <h1 style={styles.title}>
            Your{" "}
            <span style={styles.accent}>
              Wishlist 🌸
            </span>
          </h1>

          <p style={styles.subtitle}>
            {wishlist.length > 0
              ? `${wishlist.length} saved product${
                  wishlist.length === 1
                    ? ""
                    : "s"
                }, including ${availableItemsCount} currently available.`
              : "Save products here to find them again later."}
          </p>
        </div>
      </header>

      {/* Content */}
      <main style={styles.container}>
        {loading ? (
          <div
            style={styles.loadingBox}
            role="status"
            aria-live="polite"
          >
            <span
              style={styles.spinner}
              aria-hidden="true"
            />

            <p style={styles.loadingText}>
              Loading your wishlist...
            </p>
          </div>
        ) : wishlist.length === 0 ? (
          <div style={styles.emptyBox}>
            <span
              style={styles.emptyIcon}
              aria-hidden="true"
            >
              💖
            </span>

            <p style={styles.emptyTitle}>
              Your wishlist is empty
            </p>

            <p style={styles.emptySubtitle}>
              Browse products and save your
              favourites for later.
            </p>

            <button
              type="button"
              style={styles.shopButton}
              onClick={() =>
                navigate("/products")
              }
            >
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <section style={styles.layout}>
            <div style={styles.listHeader}>
              <div>
                <h2
                  style={styles.sectionTitle}
                >
                  Saved Items

                  <span
                    style={styles.countBadge}
                  >
                    {wishlist.length}
                  </span>
                </h2>

                <p style={styles.listText}>
                  Move available products to
                  your cart or remove them
                  from this list.
                </p>
              </div>

              <button
                type="button"
                style={{
                  ...styles.clearButton,
                  opacity: clearing
                    ? 0.6
                    : 1,
                  cursor: clearing
                    ? "not-allowed"
                    : "pointer",
                }}
                onClick={
                  handleClearWishlist
                }
                disabled={clearing}
              >
                {clearing
                  ? "Clearing..."
                  : "🗑️ Clear All"}
              </button>
            </div>

            <div style={styles.itemsStack}>
              {wishlist.map((item) => {
                const productId =
                  Number(item.productId);

                return (
                  <WishlistCard
                    key={
                      item.id ??
                      productId
                    }
                    item={item}
                    onRemove={
                      handleRemove
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                    isInCart={cartProductIds.includes(
                      productId
                    )}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ margin: 0 }}>
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
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
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
  headerBadge: {
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

  container: { padding: "40px 60px", maxWidth: "1000px", margin: "0 auto" },

  loadingBox: {
    textAlign: "center",
    padding: "80px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  spinner: {
    display: "inline-block",
    width: "44px",
    height: "44px",
    border: "4px solid #fce4ec",
    borderTop: "4px solid #e91e8c",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "16px", color: "#f48fb1", margin: 0 },

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
  shopBtn: {
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

  layout: { display: "flex", flexDirection: "column", gap: "20px" },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  countBadge: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 10px",
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

  footer: {
    background: "#2d2d2d",
    textAlign: "center",
    padding: "24px",
    fontSize: "13px",
    color: "#666",
    marginTop: "60px",
  },
};
