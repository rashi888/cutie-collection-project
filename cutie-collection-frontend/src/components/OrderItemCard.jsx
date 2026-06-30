export default function OrderItemCard({ item }) {
  return (
    <div style={styles.card}>
      {/* Image */}
      <div style={styles.imageBox}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} style={styles.image} />
        ) : (
          <span style={styles.placeholder}>🛍️</span>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <p style={styles.name}>{item.productName}</p>
        <p style={styles.unit}>₹{item.price} each</p>
      </div>

      {/* Qty */}
      <div style={styles.qtyBadge}>
        × {item.quantity}
      </div>

      {/* Subtotal */}
      <p style={styles.subtotal}>₹{(item.price * item.quantity).toFixed(2)}</p>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "16px",
    padding: "14px 18px",
    border: "1px solid #f8bbd0",
    fontFamily: "'Poppins', sans-serif",
    flexWrap: "wrap",
  },
  imageBox: {
    background: "#fff",
    borderRadius: "12px",
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    border: "1px solid #f8bbd0",
  },
  image: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" },
  placeholder: { fontSize: "28px" },
  info: { flex: 1, minWidth: "120px" },
  name: { fontSize: "14px", fontWeight: "700", color: "#333", margin: 0 },
  unit: { fontSize: "11px", color: "#aaa", margin: 0, marginTop: "3px" },
  qtyBadge: {
    background: "#fff",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "4px 14px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#e91e8c",
  },
  subtotal: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#e91e8c",
    margin: 0,
    minWidth: "80px",
    textAlign: "right",
  },
};