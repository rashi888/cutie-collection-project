export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div style={styles.card}>

      {/* Image */}
      <div style={styles.imageBox}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={styles.image} />
        ) : (
          <span style={styles.imagePlaceholder}>🛍️</span>
        )}
      </div>

      {/* Category Badge */}
      {product.categoryName && (
        <span style={styles.categoryBadge}>{product.categoryName}</span>
      )}

      {/* Name */}
      <h3 style={styles.name}>{product.name}</h3>

      {/* Description */}
      {product.description && (
        <p style={styles.desc}>{product.description}</p>
      )}

      {/* Price & Stock */}
      <div style={styles.priceRow}>
        <span style={styles.price}>₹{product.price}</span>
        <span style={product.stockQuantity > 0 ? styles.inStock : styles.outStock}>
          {product.stockQuantity > 0 ? `Stock: ${product.stockQuantity}` : "Out of Stock"}
        </span>
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div style={styles.actions}>
          {onEdit && (
            <button style={styles.editBtn} onClick={() => onEdit(product)}>
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button style={styles.deleteBtn} onClick={() => onDelete(product.id)}>
              🗑️ Delete
            </button>
          )}
        </div>
      )}

      {/* Shop button - shown when no admin actions */}
      {!onEdit && !onDelete && (
        <button style={styles.shopBtn}>Add to Cart 🛒</button>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 4px 20px rgba(244,143,177,0.1)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  imageBox: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "14px",
    height: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: "4px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "14px",
  },
  imagePlaceholder: { fontSize: "56px" },
  categoryBadge: {
    background: "#fff0f5",
    color: "#e91e8c",
    border: "1px solid #f8bbd0",
    borderRadius: "10px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  name: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#333",
    margin: 0,
  },
  desc: {
    fontSize: "12px",
    color: "#888",
    lineHeight: "1.5",
    margin: 0,
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "4px",
    paddingTop: "10px",
    borderTop: "1px solid #fce4ec",
  },
  price: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#e91e8c",
  },
  inStock: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#2e7d32",
    background: "#f0fff4",
    border: "1px solid #c8e6c9",
    borderRadius: "8px",
    padding: "3px 8px",
  },
  outStock: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#c62828",
    background: "#fff5f5",
    border: "1px solid #ffcdd2",
    borderRadius: "8px",
    padding: "3px 8px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
  },
  editBtn: {
    flex: 1,
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c2185b",
    fontFamily: "'Poppins', sans-serif",
  },
  deleteBtn: {
    flex: 1,
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "10px",
    padding: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#c2185b",
    fontFamily: "'Poppins', sans-serif",
  },
  shopBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
    marginTop: "4px",
  },
};