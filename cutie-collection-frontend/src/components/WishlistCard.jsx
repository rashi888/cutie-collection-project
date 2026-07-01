import { useState } from "react";

export default function WishlistCard({ item, onRemove, onAddToCart }) {
  const [removing, setRemoving]   = useState(false);
  const [adding,   setAdding]     = useState(false);
  const [added,    setAdded]      = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.productId);
  };

  const handleAddToCart = async () => {
    if (adding || added) return;
    setAdding(true);
    await onAddToCart(item);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      style={{
        ...styles.card,
        opacity:    removing ? 0 : 1,
        transform:  removing ? "translateX(40px)" : "translateX(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
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
          <span style={styles.categoryBadge}>{item.categoryName}</span>
        )}
        <p style={styles.price}>₹{item.price}</p>
        <span style={item.stockQuantity > 0 ? styles.inStock : styles.outStock}>
          {item.stockQuantity > 0 ? `In Stock: ${item.stockQuantity}` : "Out of Stock"}
        </span>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {/* Add to Cart */}
        <button
          style={
            added
              ? { ...styles.cartBtn, background: "linear-gradient(135deg, #66bb6a, #2e7d32)" }
              : item.stockQuantity <= 0
              ? { ...styles.cartBtn, opacity: 0.5, cursor: "not-allowed" }
              : styles.cartBtn
          }
          onClick={handleAddToCart}
          disabled={adding || added || item.stockQuantity <= 0}
        >
          {adding ? "Adding..." : added ? "✅ Added!" : "🛒 Add to Cart"}
        </button>

        {/* Remove from Wishlist */}
        <button
          style={{
            ...styles.removeBtn,
            opacity:    removing ? 0.5 : 1,
            transform:  removing ? "scale(0.9)" : "scale(1)",
            transition: "opacity 0.2s, transform 0.2s",
          }}
          onClick={handleRemove}
          disabled={removing}
          title="Remove from wishlist"
        >
          🗑️ Remove
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px 24px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 4px 20px rgba(244,143,177,0.12)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  imageBox: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "14px",
    width: "90px",
    height: "90px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    border: "1px solid #fce4ec",
  },
  image: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" },
  imagePlaceholder: { fontSize: "40px" },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "140px",
  },
  name: { fontSize: "15px", fontWeight: "700", color: "#333", margin: 0 },
  categoryBadge: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    color: "#e91e8c",
    border: "1px solid #f8bbd0",
    borderRadius: "20px",
    padding: "2px 12px",
    fontSize: "11px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  price: { fontSize: "18px", fontWeight: "800", color: "#e91e8c", margin: 0 },
  inStock: {
    fontSize: "11px", fontWeight: "600", color: "#2e7d32",
    background: "#f0fff4", border: "1px solid #c8e6c9",
    borderRadius: "20px", padding: "3px 10px", alignSelf: "flex-start",
  },
  outStock: {
    fontSize: "11px", fontWeight: "600", color: "#c62828",
    background: "#fff5f5", border: "1px solid #ffcdd2",
    borderRadius: "20px", padding: "3px 10px", alignSelf: "flex-start",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "140px",
  },
  cartBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  removeBtn: {
    background: "#fff5f8",
    color: "#c2185b",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
};