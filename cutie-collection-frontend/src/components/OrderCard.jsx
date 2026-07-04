import { useState } from "react";
import OrderItemCard from "./OrderItemCard";

const statusStyles = {
  PENDING:   { bg: "#fff8e1", color: "#f57f17", border: "#ffe082",  label: "⏳ Pending"   },
  CONFIRMED: { bg: "#e8f5e9", color: "#2e7d32", border: "#c8e6c9",  label: "✅ Confirmed"  },
  SHIPPED:   { bg: "#e3f2fd", color: "#1565c0", border: "#bbdefb",  label: "🚚 Shipped"   },
  DELIVERED: { bg: "#f3e5f5", color: "#6a1b9a", border: "#e1bee7",  label: "🎀 Delivered" },
  CANCELLED: { bg: "#ffebee", color: "#c62828", border: "#ffcdd2",  label: "❌ Cancelled"  },
};

export default function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const st =
  statusStyles[order.orderStatus] ||
  statusStyles.PENDING;
  const total = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || order.totalAmount || 0;

  return (
    <div style={styles.card}>
      {/* Header Row */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <p style={styles.orderId}>Order #{order.id}</p>
          <p style={styles.date}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : "—"}
          </p>
        </div>

        <div style={styles.headerRight}>
  
  <span
    style={{
      background: "#ffe4ec",
      color: "#d63384",
      border: "1px solid #f8bbd0",
      borderRadius: "20px",
      padding: "4px 14px",
      fontSize: "12px",
      fontWeight: "700",
      marginBottom: "4px",
    }}
  >
    Payment: ✅ {order.paymentStatus || "PAID"}
  </span>

  <span
    style={{
      ...styles.statusBadge,
      background: st.bg,
      color: st.color,
      border: `1px solid ${st.border}`,
    }}
  >
   Order: {st.label}
  </span>

  <p style={styles.totalAmt}>
    ₹{Number(total).toFixed(2)}
  </p>

</div>
      </div>

      {/* Items preview / expanded */}
      {order.items && order.items.length > 0 && (
        <>
          <button style={styles.toggleBtn} onClick={() => setExpanded(!expanded)}>
            {expanded ? "▲ Hide Items" : `▼ View ${order.items.length} item${order.items.length > 1 ? "s" : ""}`}
          </button>

          {expanded && (
            <div style={styles.itemsList}>
              {order.items.map((item, idx) => (
                <OrderItemCard key={idx} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Cancel button */}
      {(order.orderStatus  === "PENDING" || order.orderStatus  === "CONFIRMED") && onCancel && (
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={() => onCancel(order.id)}>
            ❌ Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "24px 28px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 8px 32px rgba(244,143,177,0.15)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "10px",
  },
  headerLeft: {},
  orderId: { fontSize: "16px", fontWeight: "700", color: "#2d2d2d", margin: 0 },
  date: { fontSize: "12px", color: "#aaa", margin: 0, marginTop: "3px" },
  headerRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" },
  statusBadge: {
    borderRadius: "20px",
    padding: "4px 14px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
  },
  totalAmt: { fontSize: "20px", fontWeight: "800", color: "#e91e8c", margin: 0 },
  toggleBtn: {
    background: "#fff0f5",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#c2185b",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    alignSelf: "flex-start",
  },
  itemsList: { display: "flex", flexDirection: "column", gap: "10px" },
  footer: { borderTop: "1.5px dashed #fce4ec", paddingTop: "12px" },
  cancelBtn: {
    background: "#fff5f8",
    border: "1.5px solid #ffcdd2",
    borderRadius: "12px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c62828",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
};