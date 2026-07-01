import { useState } from "react";

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onAddToCart,
  onAddToWishlist,

}) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (adding || product.stockQuantity <= 0) return;
    setAdding(true);
    await onAddToCart(product);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="product-card" style={styles.card}>
      {/* Image */}
      <div style={styles.imageBox}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={styles.image} />
        ) : (
          <span style={styles.imagePlaceholder}>🛍️</span>
        )}
      </div>

      {/* Category */}
      {product.categoryName && (
        <span style={styles.categoryBadge}>{product.categoryName}</span>
      )}

      {/* Name */}
      <h3 style={styles.name}>{product.name}</h3>

      {/* Description */}
      {product.description && <p style={styles.desc}>{product.description}</p>}

      {/* Price & Stock */}
      <div style={styles.priceRow}>
        <span style={styles.price}>₹{product.price}</span>
        <span
          style={product.stockQuantity > 0 ? styles.inStock : styles.outStock}
        >
          {product.stockQuantity > 0
            ? `Stock: ${product.stockQuantity}`
            : "Out of Stock"}
        </span>
      </div>

      {/* ✅ USER MODE */}
{!onEdit && !onDelete && onAddToCart && (
  <div style={{ display: "flex", gap: "10px", width: "100%" }}>
    
    <button
      className="shop-btn"
      style={
        product.stockQuantity <= 0
          ? {
              ...styles.shopBtn,
              opacity: 0.5,
              cursor: "not-allowed",
            }
          : added
          ? {
              ...styles.shopBtn,
              background:
                "linear-gradient(135deg, #66bb6a, #2e7d32)",
            }
          : styles.shopBtn
      }
      onClick={handleAddToCart}
      disabled={product.stockQuantity <= 0 || adding}
    >
      {adding
        ? "Adding..."
        : added
        ? "✅ Added!"
        : "🛒 Add To Cart"}
    </button>

    <button
      style={{
        background: "#fff5f8",
        color: "#e91e8c",
        border: "1.5px solid #f8bbd0",
        borderRadius: "12px",
        padding: "10px 14px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "'Poppins', sans-serif",
      }}
      onClick={() => onAddToWishlist?.(product)}
    >
      💖 Wishlist
    </button>

  </div>
)}

      {/* ✅ ADMIN MODE */}
      {(onEdit || onDelete) && (
        <div style={styles.actions}>
          {onEdit && (
            <button style={styles.editBtn} onClick={() => onEdit(product)}>
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button
              style={styles.deleteBtn}
              onClick={() => onDelete(product.id)}
            >
              🗑️ Delete
            </button>
          )}
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
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 8px 32px rgba(244,143,177,0.18)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    animation: "fadeInUp 0.4s ease forwards",
  },
  imageBox: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    borderRadius: "18px",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: "4px",
    border: "1px solid #fce4ec",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "18px",
  },
  imagePlaceholder: { fontSize: "64px", lineHeight: 1 },
  categoryBadge: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    color: "#e91e8c",
    border: "1px solid #f8bbd0",
    borderRadius: "20px",
    padding: "4px 14px",
    fontSize: "11px",
    fontWeight: "700",
    alignSelf: "flex-start",
    letterSpacing: "0.3px",
  },
  name: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2d2d2d",
    margin: 0,
    lineHeight: "1.4",
  },
  desc: { fontSize: "12px", color: "#f48fb1", lineHeight: "1.6", margin: 0 },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
    paddingTop: "12px",
    borderTop: "1.5px solid #fce4ec",
  },
  price: { fontSize: "22px", fontWeight: "800", color: "#e91e8c" },
  inStock: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#2e7d32",
    background: "#f0fff4",
    border: "1px solid #c8e6c9",
    borderRadius: "20px",
    padding: "4px 12px",
  },
  outStock: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#c62828",
    background: "#fff5f5",
    border: "1px solid #ffcdd2",
    borderRadius: "20px",
    padding: "4px 12px",
  },
  actions: { display: "flex", gap: "8px", marginTop: "4px" },
  editBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    padding: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c2185b",
    fontFamily: "'Poppins', sans-serif",
    transition: "transform 0.15s",
  },
  deleteBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    padding: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c2185b",
    fontFamily: "'Poppins', sans-serif",
    transition: "transform 0.15s",
  },
  shopBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
    marginTop: "4px",
    letterSpacing: "0.3px",
    transition:
      "transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease",
  },
};
