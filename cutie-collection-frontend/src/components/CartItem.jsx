import { useEffect, useState } from "react";

export default function CartItem({ item, onQuantityChange, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const [qtyLoading, setQtyLoading] = useState(false);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.imageUrl]);

  const unitPrice = Number(item.unitPrice ?? item.price ?? 0);

  const availableStock = Number(item.availableStock ?? 0);

  const productUnavailable =
    item.productActive === false || availableStock <= 0;

  const quantity = Number(item.quantity || 0);

  const maximumQuantityReached =
    availableStock > 0 && quantity >= availableStock;

  const calculatedSubtotal = unitPrice * quantity;

  const subtotal = Number(item.subtotal ?? calculatedSubtotal);

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleQuantityChange = async (newQuantity) => {
    if (
      newQuantity < 1 ||
      qtyLoading ||
      removing ||
      productUnavailable ||
      !onQuantityChange
    ) {
      return;
    }

    if (availableStock > 0 && newQuantity > availableStock) {
      return;
    }

    try {
      setQtyLoading(true);

      await onQuantityChange(item.id, newQuantity);
    } finally {
      setQtyLoading(false);
    }
  };

  const handleRemove = async () => {
    if (removing || qtyLoading || !onRemove) {
      return;
    }

    try {
      setRemoving(true);

      await onRemove(item.id);
    } catch {
      /*
       * Restore the cart item when deletion fails.
       * CartPage should display the error notification.
       */
      setRemoving(false);
    }
  };

  return (
    <article
      className="cart-item-enter cart-item-card"
      style={{
        ...styles.card,
        opacity: removing ? 0 : 1,
        transform: removing ? "translateX(40px)" : "translateX(0)",
        transition:
          "opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Product image */}
      <div style={styles.imageBox}>
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.productName || "Product"}
            style={styles.image}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <span style={styles.imagePlaceholder} aria-hidden="true">
            🛍️
          </span>
        )}
      </div>

      {/* Product information */}
      <div style={styles.info}>
        <h3 style={styles.name}>{item.productName}</h3>

        {item.categoryName && (
          <span style={styles.badge}>{item.categoryName}</span>
        )}

        <p style={styles.unitPrice}>₹{formatCurrency(unitPrice)} each</p>

        {productUnavailable && (
          <span style={styles.unavailableText}>
            This product is no longer available
          </span>
        )}

        {!productUnavailable && availableStock > 0 && (
          <span style={styles.stockText}>{availableStock} available</span>
        )}
      </div>

      {/* Quantity controls */}
      <div
        style={styles.quantitySection}
        aria-label={`Quantity for ${item.productName}`}
      >
        <div style={styles.qtyBox}>
          <button
            type="button"
            className="qty-btn"
            style={{
              ...styles.qtyBtn,
              opacity:
                item.quantity <= 1 ||
                qtyLoading ||
                removing ||
                productUnavailable
                  ? 0.4
                  : 1,
            }}
            // onClick={() => handleQuantityChange(item.quantity - 1)}
            onClick={() => handleQuantityChange(quantity - 1)}
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={
              item.quantity <= 1 || qtyLoading || removing || productUnavailable
            }
            aria-label={`Decrease ${item.productName} quantity`}
          >
            −
          </button>

          {qtyLoading ? (
            <span style={styles.qtySpinner} aria-label="Updating quantity" />
          ) : (
            quantity
          )}

          <span style={styles.qtyNum} aria-live="polite">
            {qtyLoading ? (
              <span style={styles.qtySpinner} aria-label="Updating quantity" />
            ) : (
              item.quantity
            )}
          </span>

          <button
            type="button"
            className="qty-btn"
            style={{
              ...styles.qtyBtn,
              opacity:
                qtyLoading ||
                removing ||
                productUnavailable ||
                maximumQuantityReached
                  ? 0.4
                  : 1,
            }}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={
              qtyLoading ||
              removing ||
              productUnavailable ||
              maximumQuantityReached
            }
            aria-label={`Increase ${item.productName} quantity`}
          >
            +
          </button>
        </div>

        {maximumQuantityReached && (
          <span style={styles.stockLimitText}>
            Maximum available quantity reached
          </span>
        )}
      </div>

      {/* Subtotal */}
      <div style={styles.subtotalBox}>
        <p style={styles.subtotalLabel}>Subtotal</p>

        <p style={styles.subtotalValue}>₹{formatCurrency(subtotal)}</p>
      </div>

      {/* Remove item */}
      <button
        type="button"
        style={{
          ...styles.removeBtn,
          opacity: removing ? 0.5 : 1,
          transform: removing ? "scale(0.9)" : "scale(1)",
          cursor: removing || qtyLoading ? "not-allowed" : "pointer",
        }}
        onClick={handleRemove}
        disabled={removing || qtyLoading}
        title={`Remove ${item.productName}`}
        aria-label={`Remove ${item.productName} from cart`}
      >
        {removing ? "⏳" : "🗑️"}
      </button>
    </article>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "18px 22px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    boxShadow: "0 4px 20px rgba(244,143,177,0.1)",
    fontFamily: "'Poppins', sans-serif",
    flexWrap: "wrap",
  },

  imageBox: {
    display: "flex",
    width: "80px",
    height: "80px",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "14px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: "14px",
    objectFit: "cover",
  },

  imagePlaceholder: {
    fontSize: "36px",
  },

  info: {
    display: "flex",
    minWidth: "150px",
    flex: 1,
    flexDirection: "column",
    gap: "5px",
  },

  name: {
    margin: 0,
    color: "#333333",
    fontSize: "15px",
    fontWeight: "700",
  },

  badge: {
    alignSelf: "flex-start",
    padding: "2px 10px",
    border: "1px solid #f8bbd0",
    borderRadius: "10px",
    background: "#fff0f5",
    color: "#c2185b",
    fontSize: "11px",
    fontWeight: "600",
  },

  unitPrice: {
    margin: 0,
    color: "#777777",
    fontSize: "12px",
  },

  stockText: {
    color: "#2e7d32",
    fontSize: "11px",
    fontWeight: "600",
  },

  unavailableText: {
    color: "#c62828",
    fontSize: "11px",
    fontWeight: "600",
  },

  quantitySection: {
    display: "flex",
    maxWidth: "190px",
    flexDirection: "column",
    alignItems: "center",
    gap: "5px",
  },

  qtyBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 14px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "30px",
    background: "#fff0f5",
  },

  qtyBtn: {
    padding: "0 4px",
    border: "none",
    background: "none",
    color: "#e91e8c",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "18px",
    fontWeight: "700",
    lineHeight: 1,
    transition: "background 0.15s ease, opacity 0.15s ease",
  },

  qtyNum: {
    display: "flex",
    minWidth: "22px",
    alignItems: "center",
    justifyContent: "center",
    color: "#333333",
    fontSize: "15px",
    fontWeight: "700",
    textAlign: "center",
  },

  qtySpinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #f8bbd0",
    borderTop: "2px solid #e91e8c",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },

  stockLimitText: {
    color: "#b26a00",
    fontSize: "9px",
    lineHeight: 1.3,
    textAlign: "center",
  },

  subtotalBox: {
    minWidth: "105px",
    textAlign: "right",
  },

  subtotalLabel: {
    margin: "0 0 2px",
    color: "#777777",
    fontSize: "11px",
  },

  subtotalValue: {
    margin: 0,
    color: "#e91e8c",
    fontSize: "17px",
    fontWeight: "700",
  },

  removeBtn: {
    flexShrink: 0,
    padding: "8px 12px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    background: "#fff5f8",
    fontSize: "16px",
    transition: "opacity 0.2s ease, transform 0.2s ease, background 0.2s ease",
  },
};
