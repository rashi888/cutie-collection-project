import { useEffect, useMemo, useState } from "react";

export default function CheckoutSummary({
  cartItems = [],
  onPlaceOrder,
  placing = false,
  canPlaceOrder = true,
}) {
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    setImageErrors({});
  }, [cartItems]);

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getUnitPrice = (item) => Number(item.unitPrice ?? item.price ?? 0);

  const getItemSubtotal = (item) => {
    const calculatedSubtotal = getUnitPrice(item) * Number(item.quantity || 0);

    return Number(item.subtotal ?? calculatedSubtotal);
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems],
  );

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0),
    [cartItems],
  );

  const hasUnavailableProducts = cartItems.some((item) => {
    const productInactive = item.productActive === false;

    const stockKnown =
      item.availableStock !== null && item.availableStock !== undefined;

    const insufficientStock =
      stockKnown && Number(item.availableStock) < Number(item.quantity || 0);

    return productInactive || insufficientStock;
  });

  const cartIsEmpty = cartItems.length === 0;

  const orderButtonDisabled =
    placing ||
    cartIsEmpty ||
    hasUnavailableProducts ||
    !canPlaceOrder ||
    typeof onPlaceOrder !== "function";

  const handleImageError = (itemId) => {
    setImageErrors((currentErrors) => ({
      ...currentErrors,
      [itemId]: true,
    }));
  };

  const handlePlaceOrder = () => {
    if (orderButtonDisabled) {
      return;
    }

    onPlaceOrder();
  };

  return (
    <aside style={styles.card}>
      <h2 style={styles.title}>Order Summary 🌸</h2>

      {/* Cart items */}
      {cartIsEmpty ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon} aria-hidden="true">
            🛍️
          </span>

          <p style={styles.emptyTitle}>Your cart is empty</p>

          <p style={styles.emptyText}>
            Add products before continuing to checkout.
          </p>
        </div>
      ) : (
        <div style={styles.itemsList}>
          {cartItems.map((item) => {
            const itemUnavailable = item.productActive === false;

            const stockKnown =
              item.availableStock !== null && item.availableStock !== undefined;

            const insufficientStock =
              stockKnown &&
              Number(item.availableStock) < Number(item.quantity || 0);

            return (
              <div key={item.id} style={styles.itemRow}>
                <div style={styles.itemImageBox}>
                  {item.imageUrl && !imageErrors[item.id] ? (
                    <img
                      src={item.imageUrl}
                      loading="lazy"
                      alt={item.productName || "Product image"}
                      style={styles.itemImage}
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <span style={styles.itemPlaceholder} aria-hidden="true">
                      🛍️
                    </span>
                  )}
                </div>

                <div style={styles.itemInfo}>
                  <p style={styles.itemName}>{item.productName}</p>

                  <p style={styles.itemQty}>Quantity: {item.quantity}</p>

                  <p style={styles.itemPrice}>
                    ₹{formatCurrency(getUnitPrice(item))} each
                  </p>

                  {itemUnavailable && (
                    <span style={styles.errorText}>Product unavailable</span>
                  )}

                  {!itemUnavailable && insufficientStock && (
                    <span style={styles.errorText}>Insufficient stock</span>
                  )}
                </div>

                <p style={styles.itemTotal}>
                  ₹{formatCurrency(getItemSubtotal(item))}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.divider} />

      {/* Price breakdown */}
      <div style={styles.row}>
        <span style={styles.label}>Items ({totalItems})</span>

        <span style={styles.value}>₹{formatCurrency(totalAmount)}</span>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Delivery</span>

        <span style={styles.includedValue}>No additional charge</span>
      </div>

      <div style={styles.divider} />

      <div style={styles.row}>
        <span style={styles.totalLabel}>Total</span>

        <span style={styles.totalValue}>₹{formatCurrency(totalAmount)}</span>
      </div>

      {hasUnavailableProducts && (
        <div style={styles.warningBox} role="alert">
          Some cart items are unavailable or exceed the available stock. Update
          your cart before placing the order.
        </div>
      )}

      {!canPlaceOrder && !cartIsEmpty && !hasUnavailableProducts && (
        <div style={styles.warningBox} role="alert">
          Select or add a shipping address before placing the order.
        </div>
      )}

      <button
        type="button"
        style={{
          ...styles.placeButton,
          opacity: orderButtonDisabled ? 0.6 : 1,
          cursor: orderButtonDisabled ? "not-allowed" : "pointer",
        }}
        onClick={handlePlaceOrder}
        disabled={orderButtonDisabled}
      >
        {placing ? "Placing order..." : "Place Order & Pay 💕"}
      </button>

      <p style={styles.securityText}>
        🔒 The final payment amount is verified securely by the backend.
      </p>
    </aside>
  );
}

const styles = {
  card: {
    position: "sticky",
    top: "90px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "28px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background: "#ffffff",
    boxShadow: "0 8px 32px rgba(244,143,177,0.12)",
    fontFamily: "'Poppins', sans-serif",
  },

  title: {
    margin: 0,
    color: "#333333",
    fontSize: "18px",
    fontWeight: "700",
  },

  itemsList: {
    display: "flex",
    maxHeight: "340px",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
  },

  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  itemImageBox: {
    display: "flex",
    width: "46px",
    height: "46px",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "10px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  itemImage: {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
    objectFit: "cover",
  },

  itemPlaceholder: {
    fontSize: "22px",
  },

  itemInfo: {
    minWidth: 0,
    flex: 1,
  },

  itemName: {
    margin: 0,
    overflow: "hidden",
    color: "#333333",
    fontSize: "13px",
    fontWeight: "600",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  itemQty: {
    margin: "2px 0 0",
    color: "#777777",
    fontSize: "11px",
  },

  itemPrice: {
    margin: "2px 0 0",
    color: "#777777",
    fontSize: "10px",
  },

  itemTotal: {
    margin: 0,
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  errorText: {
    display: "block",
    marginTop: "3px",
    color: "#c62828",
    fontSize: "10px",
    fontWeight: "600",
  },

  divider: {
    margin: "2px 0",
    borderTop: "1.5px dashed #f8bbd0",
  },

  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },

  label: {
    color: "#777777",
    fontSize: "14px",
  },

  value: {
    color: "#333333",
    fontSize: "14px",
    fontWeight: "600",
  },

  includedValue: {
    color: "#2e7d32",
    fontSize: "13px",
    fontWeight: "600",
  },

  totalLabel: {
    color: "#333333",
    fontSize: "16px",
    fontWeight: "700",
  },

  totalValue: {
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "800",
  },

  placeButton: {
    width: "100%",
    marginTop: "4px",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
    color: "#ffffff",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
  },

  warningBox: {
    padding: "11px 13px",
    border: "1px solid #ffe082",
    borderRadius: "11px",
    background: "#fff8e1",
    color: "#8a5b00",
    fontSize: "11px",
    lineHeight: "1.5",
  },

  securityText: {
    margin: 0,
    color: "#777777",
    fontSize: "10px",
    lineHeight: "1.5",
    textAlign: "center",
  },

  emptyState: {
    padding: "28px 16px",
    border: "1.5px dashed #f8bbd0",
    borderRadius: "16px",
    background: "#fffafd",
    textAlign: "center",
  },

  emptyIcon: {
    display: "block",
    marginBottom: "8px",
    fontSize: "38px",
  },

  emptyTitle: {
    margin: "0 0 5px",
    color: "#c2185b",
    fontSize: "14px",
    fontWeight: "700",
  },

  emptyText: {
    margin: 0,
    color: "#777777",
    fontSize: "11px",
  },
};
