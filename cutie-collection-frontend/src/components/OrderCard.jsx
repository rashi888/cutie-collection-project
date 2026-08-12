import { useMemo, useState } from "react";

import OrderItemCard from "./OrderItemCard";

const ORDER_STATUS_STYLES = {
  PENDING: {
    background: "#fff8e1",
    color: "#a96100",
    border: "#ffe082",
    label: "⏳ Pending",
  },

  CONFIRMED: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "#c8e6c9",
    label: "✅ Confirmed",
  },

  PROCESSING: {
    background: "#fff3e0",
    color: "#e65100",
    border: "#ffcc80",
    label: "📦 Processing",
  },

  SHIPPED: {
    background: "#e3f2fd",
    color: "#1565c0",
    border: "#bbdefb",
    label: "🚚 Shipped",
  },

  DELIVERED: {
    background: "#f3e5f5",
    color: "#6a1b9a",
    border: "#e1bee7",
    label: "🎀 Delivered",
  },

  CANCELLED: {
    background: "#ffebee",
    color: "#c62828",
    border: "#ffcdd2",
    label: "❌ Cancelled",
  },
};

const PAYMENT_STATUS_STYLES = {
  PENDING: {
    background: "#fff8e1",
    color: "#a96100",
    border: "#ffe082",
    label: "⏳ Payment Pending",
  },

  PAID: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "#c8e6c9",
    label: "✅ Paid",
  },

  FAILED: {
    background: "#ffebee",
    color: "#c62828",
    border: "#ffcdd2",
    label: "❌ Payment Failed",
  },

  REFUNDED: {
    background: "#e3f2fd",
    color: "#1565c0",
    border: "#bbdefb",
    label: "↩️ Refunded",
  },
};

export default function OrderCard({
  order,
  onCancel,
  cancelling = false,
}) {
  const [expanded, setExpanded] =
    useState(false);

  const orderStatus =
    order.orderStatus || "PENDING";

  const paymentStatus =
    order.paymentStatus || "PENDING";

  const orderStatusStyle =
    ORDER_STATUS_STYLES[orderStatus] ||
    ORDER_STATUS_STYLES.PENDING;

  const paymentStatusStyle =
    PAYMENT_STATUS_STYLES[paymentStatus] ||
    PAYMENT_STATUS_STYLES.PENDING;

  const orderItems = Array.isArray(
    order.items
  )
    ? order.items
    : [];

  const calculatedTotal = useMemo(
    () =>
      orderItems.reduce(
        (sum, item) => {
          const unitPrice = Number(
            item.unitPrice ??
              item.price ??
              0
          );

          const quantity = Number(
            item.quantity || 0
          );

          const itemSubtotal = Number(
            item.subtotal ??
              unitPrice * quantity
          );

          return sum + itemSubtotal;
        },
        0
      ),
    [orderItems]
  );

  const totalAmount = Number(
    order.totalAmount ??
      calculatedTotal
  );

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  const formattedDate = order.createdAt
    ? new Date(
        order.createdAt
      ).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date unavailable";

  const orderDisplayNumber =
    order.orderNumber ||
    `#${order.id}`;

  const canCancel =
    (orderStatus === "PENDING" ||
      orderStatus === "CONFIRMED") &&
    typeof onCancel === "function";

  const handleCancel = async () => {
    if (!canCancel || cancelling) {
      return;
    }

    await onCancel(order.id);
  };

  return (
    <article style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <p style={styles.orderLabel}>
            Order
          </p>

          <p style={styles.orderNumber}>
            {orderDisplayNumber}
          </p>

          <p style={styles.date}>
            {formattedDate}
          </p>
        </div>

        <div style={styles.headerRight}>
          <span
            style={{
              ...styles.statusBadge,
              background:
                paymentStatusStyle.background,
              color:
                paymentStatusStyle.color,
              border: `1px solid ${paymentStatusStyle.border}`,
            }}
          >
            {paymentStatusStyle.label}
          </span>

          <span
            style={{
              ...styles.statusBadge,
              background:
                orderStatusStyle.background,
              color: orderStatusStyle.color,
              border: `1px solid ${orderStatusStyle.border}`,
            }}
          >
            {orderStatusStyle.label}
          </span>

          <p style={styles.totalAmount}>
            ₹{formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      {/* Shipping summary */}
      {order.shippingAddress && (
        <div style={styles.shippingBox}>
          <span
            style={styles.shippingIcon}
            aria-hidden="true"
          >
            📍
          </span>

          <div>
            <p style={styles.shippingTitle}>
              Delivery address
            </p>

            <p style={styles.shippingText}>
              {[
                order.shippingAddress
                  .addressLine1,
                order.shippingAddress
                  .addressLine2,
                order.shippingAddress.city,
                order.shippingAddress.state,
                order.shippingAddress
                  .postalCode,
                order.shippingAddress.country,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      {orderItems.length > 0 ? (
        <>
          <button
            type="button"
            style={styles.toggleButton}
            onClick={() =>
              setExpanded(
                (currentValue) =>
                  !currentValue
              )
            }
            aria-expanded={expanded}
          >
            {expanded
              ? "▲ Hide items"
              : `▼ View ${
                  orderItems.length
                } item${
                  orderItems.length === 1
                    ? ""
                    : "s"
                }`}
          </button>

          {expanded && (
            <div style={styles.itemsList}>
              {orderItems.map(
                (item, index) => (
                  <OrderItemCard
                    key={
                      item.id ??
                      `${item.productId}-${index}`
                    }
                    item={item}
                  />
                )
              )}
            </div>
          )}
        </>
      ) : (
        <p style={styles.noItemsText}>
          Order-item details are unavailable.
        </p>
      )}

      {/* Customer cancellation */}
      {canCancel && (
        <div style={styles.footer}>
          <button
            type="button"
            style={{
              ...styles.cancelButton,
              opacity: cancelling
                ? 0.6
                : 1,
              cursor: cancelling
                ? "not-allowed"
                : "pointer",
            }}
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? "Cancelling..."
              : "❌ Cancel Order"}
          </button>

          <span style={styles.cancelNote}>
            Cancelling an eligible order
            restores its reserved stock.
          </span>
        </div>
      )}
    </article>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "24px 28px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background:
      "rgba(255,255,255,0.95)",
    boxShadow:
      "0 8px 32px rgba(244,143,177,0.15)",
    backdropFilter: "blur(20px)",
    fontFamily: "'Poppins', sans-serif",
  },

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },

  headerLeft: {
    minWidth: "180px",
  },

  orderLabel: {
    margin: "0 0 2px",
    color: "#888888",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  orderNumber: {
    margin: 0,
    color: "#2d2d2d",
    fontSize: "16px",
    fontWeight: "700",
    overflowWrap: "anywhere",
  },

  date: {
    margin: "4px 0 0",
    color: "#777777",
    fontSize: "11px",
  },

  headerRight: {
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "column",
    gap: "6px",
  },

  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textAlign: "center",
  },

  totalAmount: {
    margin: "3px 0 0",
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "800",
  },

  shippingBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 14px",
    border: "1px solid #f8bbd0",
    borderRadius: "13px",
    background: "#fffafd",
  },

  shippingIcon: {
    flexShrink: 0,
    fontSize: "18px",
  },

  shippingTitle: {
    margin: "0 0 3px",
    color: "#a81750",
    fontSize: "11px",
    fontWeight: "700",
  },

  shippingText: {
    margin: 0,
    color: "#666666",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  toggleButton: {
    alignSelf: "flex-start",
    padding: "8px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    background: "#fff0f5",
    color: "#c2185b",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    fontWeight: "600",
  },

  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  noItemsText: {
    margin: 0,
    padding: "12px",
    borderRadius: "12px",
    background: "#fffafd",
    color: "#777777",
    fontSize: "11px",
    textAlign: "center",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    paddingTop: "12px",
    borderTop:
      "1.5px dashed #fce4ec",
    flexWrap: "wrap",
  },

  cancelButton: {
    padding: "8px 18px",
    border: "1.5px solid #ffcdd2",
    borderRadius: "12px",
    background: "#fff5f8",
    color: "#c62828",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    fontWeight: "600",
  },

  cancelNote: {
    flex: 1,
    minWidth: "180px",
    color: "#777777",
    fontSize: "10px",
    lineHeight: 1.5,
  },
};