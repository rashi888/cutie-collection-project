import { useState } from "react";

export default function CartItem({ item, onQuantityChange, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [qtyLoading, setQtyLoading] = useState(false);

  const handleQty = async (newQty) => {
    if (newQty < 1 || qtyLoading) return;
    setQtyLoading(true);
    await onQuantityChange(item.id, newQty);
    setQtyLoading(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.id);
  };

  return (
    <div
      className="cart-item-enter cart-item-card"
      style={{
        ...styles.card,
        opacity: removing ? 0 : 1,
        transform: removing ? "translateX(40px)" : "translateX(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s, border-color 0.2s",
      }}
    >
      {/* Image */}
      <div style={styles.imageBox}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} style={styles.image} />
        ) : (
          <span style={styles.imagePlaceholder}>🛍️</span>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <h3 style={styles.name}>{item.productName}</h3>
        {item.categoryName && (
          <span style={styles.badge}>{item.categoryName}</span>
        )}
        <p style={styles.unitPrice}>₹{item.price} each</p>
      </div>

      {/* Quantity Controls */}
      <div style={styles.qtyBox}>
        <button
          className="qty-btn"
          style={{
            ...styles.qtyBtn,
            opacity: item.quantity <= 1 || qtyLoading ? 0.4 : 1,
            transition: "background 0.15s, opacity 0.15s",
          }}
          onClick={() => handleQty(item.quantity - 1)}
          disabled={item.quantity <= 1 || qtyLoading}
        >−</button>

        <span style={styles.qtyNum}>
          {qtyLoading
            ? <span style={styles.qtySpinner} />
            : item.quantity
          }
        </span>

        <button
          className="qty-btn"
          style={{
            ...styles.qtyBtn,
            opacity: qtyLoading ? 0.4 : 1,
            transition: "background 0.15s, opacity 0.15s",
          }}
          onClick={() => handleQty(item.quantity + 1)}
          disabled={qtyLoading}
        >+</button>
      </div>

      {/* Subtotal */}
      <div style={styles.subtotalBox}>
        <p style={styles.subtotalLabel}>Subtotal</p>
        <p style={styles.subtotalValue}>₹{(item.price * item.quantity).toFixed(2)}</p>
      </div>

      {/* Remove */}
      <button
        style={{
          ...styles.removeBtn,
          opacity: removing ? 0.5 : 1,
          transform: removing ? "scale(0.9)" : "scale(1)",
          transition: "opacity 0.2s, transform 0.2s, background 0.2s",
        }}
        onClick={handleRemove}
        disabled={removing}
        title="Remove item"
      >🗑️</button>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff", borderRadius: "20px", padding: "18px 22px",
    border: "1.5px solid #f8bbd0", boxShadow: "0 4px 20px rgba(244,143,177,0.1)",
    fontFamily: "'Poppins', sans-serif", display: "flex",
    alignItems: "center", gap: "18px", flexWrap: "wrap",
  },
  imageBox: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)", borderRadius: "14px",
    width: "80px", height: "80px", display: "flex", alignItems: "center",
    justifyContent: "center", overflow: "hidden", flexShrink: 0,
  },
  image: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" },
  imagePlaceholder: { fontSize: "36px" },
  info: { flex: 1, display: "flex", flexDirection: "column", gap: "5px", minWidth: "140px" },
  name: { fontSize: "15px", fontWeight: "700", color: "#333", margin: 0 },
  badge: {
    background: "#fff0f5", color: "#e91e8c", border: "1px solid #f8bbd0",
    borderRadius: "10px", padding: "2px 10px", fontSize: "11px",
    fontWeight: "600", alignSelf: "flex-start",
  },
  unitPrice: { fontSize: "12px", color: "#aaa", margin: 0 },
  qtyBox: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#fff0f5", border: "1.5px solid #f8bbd0",
    borderRadius: "30px", padding: "6px 14px",
  },
  qtyBtn: {
    background: "none", border: "none", fontSize: "18px", fontWeight: "700",
    color: "#e91e8c", cursor: "pointer", lineHeight: 1, padding: "0 4px",
    fontFamily: "'Poppins', sans-serif",
  },
  qtyNum: {
    fontSize: "15px", fontWeight: "700", color: "#333",
    minWidth: "22px", textAlign: "center",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qtySpinner: {
    display: "inline-block", width: "14px", height: "14px",
    border: "2px solid #f8bbd0", borderTop: "2px solid #e91e8c",
    borderRadius: "50%", animation: "spin 0.6s linear infinite",
  },
  subtotalBox: { textAlign: "right", minWidth: "90px" },
  subtotalLabel: { fontSize: "11px", color: "#aaa", margin: 0, marginBottom: "2px" },
  subtotalValue: { fontSize: "17px", fontWeight: "700", color: "#e91e8c", margin: 0 },
  removeBtn: {
    background: "#fff5f8", border: "1.5px solid #f8bbd0",
    borderRadius: "12px", padding: "8px 12px",
    cursor: "pointer", fontSize: "16px", flexShrink: 0,
  },
};