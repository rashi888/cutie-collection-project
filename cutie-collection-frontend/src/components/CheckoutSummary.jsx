export default function CheckoutSummary({ cartItems, onPlaceOrder, placing }) {
  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Order Summary 🌸</h2>

      {/* Items List */}
      <div style={styles.itemsList}>
        {cartItems.map((item) => (
          <div key={item.id} style={styles.itemRow}>
            <div style={styles.itemImageBox}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} style={styles.itemImage} />
              ) : (
                <span style={styles.itemPlaceholder}>🛍️</span>
              )}
            </div>
            <div style={styles.itemInfo}>
              <p style={styles.itemName}>{item.productName}</p>
              <p style={styles.itemQty}>Qty: {item.quantity}</p>
            </div>
            <p style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      {/* Price Breakdown */}
      <div style={styles.row}>
        <span style={styles.label}>Items ({totalItems})</span>
        <span style={styles.value}>₹{total.toFixed(2)}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Delivery</span>
        <span style={{ ...styles.value, color: "#2e7d32", fontWeight: "600" }}>FREE 🎀</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Discount</span>
        <span style={{ ...styles.value, color: "#e91e8c" }}>— ₹0.00</span>
      </div>

      <div style={styles.divider} />

      <div style={styles.row}>
        <span style={styles.totalLabel}>Total</span>
        <span style={styles.totalValue}>₹{total.toFixed(2)}</span>
      </div>

      <button
        style={placing ? { ...styles.placeBtn, opacity: 0.6, cursor: "not-allowed" } : styles.placeBtn}
        onClick={onPlaceOrder}
        disabled={placing}
      >
        {placing ? "Placing Order..." : "✅ Place Order 💕"}
      </button>

      {/* Promo note */}
      <div style={styles.promoCard}>
        <span style={{ fontSize: "20px" }}>🎀</span>
        <div>
          <p style={styles.promoTitle}>Free Shipping!</p>
          <p style={styles.promoSub}>On all orders — because you deserve it 💕</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "28px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 8px 32px rgba(244,143,177,0.12)",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "sticky",
    top: "90px",
  },
  title: { fontSize: "18px", fontWeight: "700", color: "#333", margin: 0 },

  itemsList: { display: "flex", flexDirection: "column", gap: "12px" },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  itemImageBox: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "10px",
    width: "46px",
    height: "46px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  itemImage: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" },
  itemPlaceholder: { fontSize: "22px" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: "13px", fontWeight: "600", color: "#333", margin: 0 },
  itemQty: { fontSize: "11px", color: "#aaa", margin: 0 },
  itemTotal: { fontSize: "14px", fontWeight: "700", color: "#e91e8c", margin: 0 },

  divider: { borderTop: "1.5px dashed #f8bbd0", margin: "2px 0" },

  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: "14px", color: "#888" },
  value: { fontSize: "14px", fontWeight: "600", color: "#333" },
  totalLabel: { fontSize: "16px", fontWeight: "700", color: "#333" },
  totalValue: { fontSize: "22px", fontWeight: "800", color: "#e91e8c" },

  placeBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
    marginTop: "4px",
  },

  promoCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  promoTitle: { fontSize: "13px", fontWeight: "700", color: "#c2185b", margin: 0 },
  promoSub: { fontSize: "11px", color: "#f48fb1", margin: 0, marginTop: "2px" },
};