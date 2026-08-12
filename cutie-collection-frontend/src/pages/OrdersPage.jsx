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

import OrderService from "../api/OrderService";
import OrderCard from "../components/OrderCard";

import {
  showError,
  showSuccess,
} from "../utils/toastUtils";

export default function OrdersPage() {
  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    cancellingOrderId,
    setCancellingOrderId,
  ] = useState(null);

  const navigate = useNavigate();

  const fetchOrders =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await OrderService.getMyOrders();

        setOrders(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        setOrders([]);

        showError(
          error,
          "Unable to load your orders"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalOrders = orders.length;

  const deliveredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderStatus ===
          "DELIVERED"
      ).length,
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        [
          "PENDING",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
        ].includes(order.orderStatus)
      ).length,
    [orders]
  );

  const cancelledOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderStatus ===
          "CANCELLED"
      ).length,
    [orders]
  );

  const handleCancel = async (
    orderId
  ) => {
    if (
      cancellingOrderId !== null
    ) {
      return;
    }

    const selectedOrder = orders.find(
      (order) => order.id === orderId
    );

    const orderReference =
      selectedOrder?.orderNumber ||
      `#${orderId}`;

    const confirmed = window.confirm(
      `Cancel order ${orderReference}? Eligible product quantities will be restored to stock.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      const response =
        await OrderService.cancelOrder(
          orderId
        );

      /*
       * Use the updated order returned by
       * the backend when available.
       */
      if (response?.data) {
        setOrders(
          (currentOrders) =>
            currentOrders.map(
              (order) =>
                order.id === orderId
                  ? response.data
                  : order
            )
        );
      } else {
        await fetchOrders();
      }

      showSuccess(
        "Order cancelled successfully"
      );
    } catch (error) {
      showError(
        error,
        "Unable to cancel the order"
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    /*
     * Remove values used by the old
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
            to="/cart"
            style={styles.navLink}
          >
            🛒 Cart
          </Link>

          <Link
            to="/wishlist"
            style={styles.navLink}
          >
            Wishlist 💗
          </Link>

          <Link
            to="/orders"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
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
          <span style={styles.headerBadge}>
            📦 My Orders
          </span>

          <h1 style={styles.title}>
            Your{" "}
            <span style={styles.accent}>
              Orders 🎀
            </span>
          </h1>

          <p style={styles.subtitle}>
            Track your purchases, view
            payment status, and manage
            eligible orders.
          </p>
        </div>
      </header>

      <main style={styles.container}>
        {/* Statistics */}
        {!loading && orders.length > 0 && (
          <section style={styles.statsGrid}>
            <StatCard
              icon="📦"
              value={totalOrders}
              label="Total Orders"
            />

            <StatCard
              icon="🚚"
              value={activeOrders}
              label="Active"
            />

            <StatCard
              icon="✅"
              value={deliveredOrders}
              label="Delivered"
            />

            <StatCard
              icon="❌"
              value={cancelledOrders}
              label="Cancelled"
            />
          </section>
        )}

        {/* Page actions */}
        {!loading && orders.length > 0 && (
          <div style={styles.listHeader}>
            <div>
              <h2 style={styles.listTitle}>
                Order History
              </h2>

              <p
                style={
                  styles.listDescription
                }
              >
                Expand an order to view its
                products and delivery details.
              </p>
            </div>

            <button
              type="button"
              style={styles.refreshButton}
              onClick={fetchOrders}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>
        )}

        {/* Order list */}
        {loading ? (
          <div
            style={styles.statusBox}
            role="status"
            aria-live="polite"
          >
            <span
              style={styles.statusIcon}
              aria-hidden="true"
            >
              🌸
            </span>

            <p style={styles.statusTitle}>
              Loading your orders...
            </p>

            <p style={styles.statusText}>
              Please wait while the order
              history is loaded.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.statusBox}>
            <span
              style={styles.statusIcon}
              aria-hidden="true"
            >
              📦
            </span>

            <p style={styles.statusTitle}>
              No orders yet
            </p>

            <p style={styles.statusText}>
              Browse the product collection
              and place your first order.
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
          <div style={styles.ordersList}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancel}
                cancelling={
                  cancellingOrderId ===
                  order.id
                }
              />
            ))}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Cutie
        Collection. Made with 💕 for all
        cuties.
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <article style={styles.statCard}>
      <span
        style={styles.statIcon}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div>
        <strong style={styles.statValue}>
          {value}
        </strong>

        <span style={styles.statLabel}>
          {label}
        </span>
      </div>
    </article>
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
    width: "min(1000px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "40px 0 70px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  statIcon: {
    fontSize: "30px",
  },

  statValue: {
    display: "block",
    color: "#e91e8c",
    fontSize: "24px",
    fontWeight: "800",
  },

  statLabel: {
    display: "block",
    marginTop: "3px",
    color: "#9f5575",
    fontSize: "11px",
    fontWeight: "600",
  },

  listHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  listTitle: {
    margin: "0 0 5px",
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "700",
  },

  listDescription: {
    margin: 0,
    color: "#777777",
    fontSize: "12px",
  },

  refreshButton: {
    padding: "8px 15px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "11px",
    background: "#fff5f8",
    color: "#a81750",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "600",
  },

  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  statusBox: {
    padding: "65px 20px",
    border: "1.5px dashed #f8bbd0",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #fffafd, #fff0f5)",
    textAlign: "center",
  },

  statusIcon: {
    display: "block",
    marginBottom: "12px",
    fontSize: "52px",
  },

  statusTitle: {
    margin: "0 0 7px",
    color: "#c2185b",
    fontSize: "19px",
    fontWeight: "700",
  },

  statusText: {
    margin: "0 0 22px",
    color: "#777777",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  shopButton: {
    padding: "12px 27px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 6px 20px rgba(233,30,140,0.25)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "700",
  },

  footer: {
    padding: "24px",
    background: "#2d2d2d",
    color: "#999999",
    fontSize: "12px",
    textAlign: "center",
  },
};