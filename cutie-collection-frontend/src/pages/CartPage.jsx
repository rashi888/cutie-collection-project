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
import CartItem from "../components/CartItem";

import {
  showError,
  showSuccess,
} from "../utils/toastUtils";

export default function CartPage() {
  const [cartItems, setCartItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [clearing, setClearing] =
    useState(false);

  const [badgeKey, setBadgeKey] =
    useState(0);

  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);

      const response =
        await CartService.getCart();

      setCartItems(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      setCartItems([]);

      showError(
        error,
        "Unable to load your cart"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const getUnitPrice = (item) =>
    Number(
      item.unitPrice ??
        item.price ??
        0
    );

  const getSubtotal = (item) => {
    const calculatedSubtotal =
      getUnitPrice(item) *
      Number(item.quantity || 0);

    return Number(
      item.subtotal ??
        calculatedSubtotal
    );
  };

  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + getSubtotal(item),
        0
      ),
    [cartItems]
  );

  const totalItems = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const hasUnavailableProducts =
    useMemo(
      () =>
        cartItems.some((item) => {
          const productInactive =
            item.productActive === false;

          const stockKnown =
            item.availableStock !== null &&
            item.availableStock !== undefined;

          const insufficientStock =
            stockKnown &&
            Number(item.availableStock) <
              Number(item.quantity || 0);

          return (
            productInactive ||
            insufficientStock
          );
        }),
      [cartItems]
    );

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const handleQuantityChange = async (
    itemId,
    newQuantity
  ) => {
    if (newQuantity < 1) {
      return;
    }

    const currentItem = cartItems.find(
      (item) => item.id === itemId
    );

    if (!currentItem) {
      return;
    }

    try {
      const response =
        await CartService.updateItem(
          itemId,
          {
            productId:
              currentItem.productId,
            quantity: newQuantity,
          }
        );

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? response.data || {
                ...item,
                quantity: newQuantity,
                subtotal:
                  getUnitPrice(item) *
                  newQuantity,
              }
            : item
        )
      );

      setBadgeKey(
        (currentKey) => currentKey + 1
      );

      showSuccess("Quantity updated");
    } catch (error) {
      showError(
        error,
        "Unable to update the quantity"
      );

      throw error;
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await CartService.removeItem(
        itemId
      );

      setCartItems((currentItems) =>
        currentItems.filter(
          (item) => item.id !== itemId
        )
      );

      setBadgeKey(
        (currentKey) => currentKey + 1
      );

      showSuccess(
        "Product removed from cart"
      );
    } catch (error) {
      showError(
        error,
        "Unable to remove the product"
      );

      throw error;
    }
  };

  const handleClearCart = async () => {
    const confirmed = window.confirm(
      "Clear all products from your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);

      await CartService.clearCart();

      setCartItems([]);

      setBadgeKey(
        (currentKey) => currentKey + 1
      );

      showSuccess(
        "Cart cleared successfully"
      );
    } catch (error) {
      showError(
        error,
        "Unable to clear the cart"
      );
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = () => {
    if (hasUnavailableProducts) {
      showError(
        "Update unavailable or understocked products before checkout"
      );

      return;
    }

    navigate("/checkout");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

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
            <span style={styles.navLogo}>
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
            to="/categories"
            style={styles.navLink}
          >
            Categories
          </Link>

          <Link
            to="/products"
            style={styles.navLink}
          >
            Products
          </Link>

          <Link
            to="/cart"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            🛒 Cart

            {totalItems > 0 && (
              <span
                key={badgeKey}
                className="badge-pop"
                style={styles.cartBadge}
              >
                {totalItems}
              </span>
            )}
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
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          🌸 Logout
        </button>
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
            🛒 My Cart
          </span>

          <h1 style={styles.title}>
            Your{" "}
            <span style={styles.accent}>
              Cutie Cart 💕
            </span>
          </h1>

          <p style={styles.subtitle}>
            {totalItems > 0
              ? `${totalItems} adorable item${
                  totalItems === 1
                    ? ""
                    : "s"
                } waiting for you!`
              : "Your cart is empty. Explore the product collection!"}
          </p>
        </div>
      </header>

      <main style={styles.container}>
        {loading ? (
          <div
            style={styles.loadingBox}
            role="status"
          >
            <span
              style={styles.loadingSpinner}
              aria-hidden="true"
            />

            <p style={styles.loadingText}>
              Loading your cart...
            </p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={styles.emptyBox}>
            <span
              style={styles.emptyIcon}
              aria-hidden="true"
            >
              🛒
            </span>

            <p style={styles.emptyTitle}>
              Your cart is empty
            </p>

            <p style={styles.emptyText}>
              Add something cute from the
              product collection.
            </p>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() =>
                navigate("/products")
              }
            >
              Shop Now 🌸
            </button>
          </div>
        ) : (
          <div style={styles.layout}>
            {/* Cart items */}
            <section style={styles.itemsSection}>
              <div style={styles.listHeader}>
                <h2 style={styles.sectionTitle}>
                  Cart Items

                  <span
                    style={
                      styles.itemCountBadge
                    }
                  >
                    {cartItems.length}
                  </span>
                </h2>

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
                  onClick={handleClearCart}
                  disabled={clearing}
                >
                  {clearing
                    ? "Clearing..."
                    : "🗑️ Clear Cart"}
                </button>
              </div>

              <div style={styles.itemsStack}>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={
                      handleQuantityChange
                    }
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </section>

            {/* Order summary */}
            <aside style={styles.summary}>
              <div style={styles.summaryCard}>
                <h2 style={styles.summaryTitle}>
                  Order Summary 🌸
                </h2>

                <div style={styles.summaryRow}>
                  <span
                    style={styles.summaryLabel}
                  >
                    Items ({totalItems})
                  </span>

                  <span
                    style={styles.summaryValue}
                  >
                    ₹
                    {formatCurrency(
                      totalAmount
                    )}
                  </span>
                </div>

                <div style={styles.summaryRow}>
                  <span
                    style={styles.summaryLabel}
                  >
                    Delivery
                  </span>

                  <span
                    style={styles.deliveryValue}
                  >
                    No additional charge
                  </span>
                </div>

                <div style={styles.divider} />

                <div style={styles.summaryRow}>
                  <span style={styles.totalLabel}>
                    Total
                  </span>

                  <span style={styles.totalValue}>
                    ₹
                    {formatCurrency(
                      totalAmount
                    )}
                  </span>
                </div>

                {hasUnavailableProducts && (
                  <div
                    style={styles.warningBox}
                    role="alert"
                  >
                    One or more products are
                    inactive or exceed the
                    available stock. Update the
                    cart before checkout.
                  </div>
                )}

                <button
                  type="button"
                  className="checkout-btn"
                  style={{
                    ...styles.checkoutButton,
                    opacity:
                      hasUnavailableProducts
                        ? 0.6
                        : 1,
                    cursor:
                      hasUnavailableProducts
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onClick={handleCheckout}
                  disabled={
                    hasUnavailableProducts
                  }
                >
                  Proceed to Checkout 💕
                </button>

                <button
                  type="button"
                  style={styles.continueButton}
                  onClick={() =>
                    navigate("/products")
                  }
                >
                  ← Continue Shopping
                </button>

                <p style={styles.securityText}>
                  🔒 Prices and stock are
                  revalidated securely during
                  order placement.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>

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
    gap: "22px",
    flexWrap: "wrap",
  },

  navLink: {
    position: "relative",
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  activeNavLink: {
    color: "#e91e8c",
    fontWeight: "700",
  },

  cartBadge: {
    position: "absolute",
    top: "-10px",
    right: "-14px",
    display: "flex",
    minWidth: "18px",
    height: "18px",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #ffffff",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "9px",
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
    fontSize: "clamp(32px, 5vw, 40px)",
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
    padding: "40px 0",
  },

  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "80px 20px",
    textAlign: "center",
  },

  loadingSpinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #fce4ec",
    borderTop: "4px solid #e91e8c",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  loadingText: {
    margin: 0,
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
    fontSize: "72px",
  },

  emptyTitle: {
    margin: "16px 0 6px",
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "700",
  },

  emptyText: {
    margin: "0 0 24px",
    color: "#9f5575",
    fontSize: "14px",
  },

  primaryButton: {
    padding: "12px 28px",
    border: "none",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "600",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(280px, 340px)",
    gap: "32px",
    alignItems: "flex-start",
  },

  itemsSection: {
    minWidth: 0,
  },

  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
    color: "#333333",
    fontSize: "20px",
    fontWeight: "700",
  },

  itemCountBadge: {
    padding: "2px 10px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
  },

  clearButton: {
    padding: "8px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    background: "#fff5f8",
    color: "#a81750",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  itemsStack: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  summary: {
    position: "sticky",
    top: "90px",
  },

  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "28px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background: "#ffffff",
    boxShadow:
      "0 8px 32px rgba(244,143,177,0.12)",
  },

  summaryTitle: {
    margin: 0,
    color: "#333333",
    fontSize: "18px",
    fontWeight: "700",
  },

  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
  },

  summaryLabel: {
    color: "#777777",
    fontSize: "14px",
  },

  summaryValue: {
    color: "#333333",
    fontSize: "14px",
    fontWeight: "600",
  },

  deliveryValue: {
    color: "#2e7d32",
    fontSize: "12px",
    fontWeight: "600",
  },

  divider: {
    margin: "4px 0",
    borderTop: "1.5px dashed #f8bbd0",
  },

  totalLabel: {
    color: "#333333",
    fontSize: "16px",
    fontWeight: "700",
  },

  totalValue: {
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "800",
  },

  warningBox: {
    padding: "11px 13px",
    border: "1px solid #ffe082",
    borderRadius: "11px",
    background: "#fff8e1",
    color: "#8a5b00",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  checkoutButton: {
    width: "100%",
    marginTop: "4px",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 4px 16px rgba(233,30,140,0.3)",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "700",
  },

  continueButton: {
    width: "100%",
    padding: "12px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    background: "#fff0f5",
    color: "#a81750",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  securityText: {
    margin: 0,
    color: "#777777",
    fontSize: "10px",
    lineHeight: 1.5,
    textAlign: "center",
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