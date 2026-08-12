import { useEffect, useState } from "react";

export default function OrderItemCard({ item }) {
  const [imageError, setImageError] =
    useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.imageUrl]);

  const quantity = Number(
    item.quantity || 0
  );

  const unitPrice = Number(
    item.unitPrice ??
      item.price ??
      0
  );

  const calculatedSubtotal =
    unitPrice * quantity;

  const subtotal = Number(
    item.subtotal ??
      calculatedSubtotal
  );

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <article style={styles.card}>
      {/* Product image */}
      <div style={styles.imageBox}>
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <span
            style={styles.placeholder}
            aria-hidden="true"
          >
            🛍️
          </span>
        )}
      </div>

      {/* Product information */}
      <div style={styles.info}>
        <p style={styles.name}>
          {item.productName ||
            "Product unavailable"}
        </p>

        {item.categoryName && (
          <span style={styles.categoryBadge}>
            {item.categoryName}
          </span>
        )}

        <p style={styles.unitPrice}>
          ₹{formatCurrency(unitPrice)} each
        </p>
      </div>

      {/* Quantity */}
      <div
        style={styles.quantityBadge}
        aria-label={`Quantity: ${quantity}`}
      >
        × {quantity}
      </div>

      {/* Subtotal */}
      <div style={styles.subtotalBox}>
        <span style={styles.subtotalLabel}>
          Subtotal
        </span>

        <p style={styles.subtotalValue}>
          ₹{formatCurrency(subtotal)}
        </p>
      </div>
    </article>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    border: "1px solid #f8bbd0",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
    fontFamily: "'Poppins', sans-serif",
    flexWrap: "wrap",
  },

  imageBox: {
    display: "flex",
    width: "56px",
    height: "56px",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid #f8bbd0",
    borderRadius: "12px",
    background: "#ffffff",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    objectFit: "cover",
  },

  placeholder: {
    fontSize: "28px",
  },

  info: {
    display: "flex",
    minWidth: "140px",
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "3px",
  },

  name: {
    margin: 0,
    color: "#333333",
    fontSize: "14px",
    fontWeight: "700",
    overflowWrap: "anywhere",
  },

  categoryBadge: {
    display: "inline-block",
    padding: "2px 8px",
    border: "1px solid #f8bbd0",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#c2185b",
    fontSize: "9px",
    fontWeight: "600",
  },

  unitPrice: {
    margin: "2px 0 0",
    color: "#777777",
    fontSize: "11px",
  },

  quantityBadge: {
    padding: "4px 14px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "700",
  },

  subtotalBox: {
    minWidth: "100px",
    textAlign: "right",
  },

  subtotalLabel: {
    display: "block",
    marginBottom: "2px",
    color: "#777777",
    fontSize: "9px",
  },

  subtotalValue: {
    margin: 0,
    color: "#e91e8c",
    fontSize: "16px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
};