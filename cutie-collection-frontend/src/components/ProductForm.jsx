export default function ProductForm({ form, onChange, onSubmit, onCancel, loading, editId, categories }) {
  return (
    <div style={styles.formCard}>
      <h2 style={styles.formTitle}>
        {editId ? "✏️ Edit Product" : "🛍️ New Product"}
      </h2>

      <form onSubmit={onSubmit} style={styles.form}>

        {/* Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Product Name</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🏷️</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. Cute Teddy Bear..."
              style={styles.input}
            />
          </div>
        </div>

        {/* Description */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Description <span style={styles.optional}>(optional)</span>
          </label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>📝</span>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Short description..."
              style={styles.input}
            />
          </div>
        </div>

        {/* Price & Stock Row */}
        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Price (₹)</label>
            <div style={styles.inputWrapper}>
              <span style={styles.icon}>💰</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={styles.input}
              />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Stock Quantity</label>
            <div style={styles.inputWrapper}>
              <span style={styles.icon}>📦</span>
              <input
                type="number"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={onChange}
                placeholder="0"
                min="0"
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Image URL <span style={styles.optional}>(optional)</span>
          </label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🖼️</span>
            <input
              type="text"
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              placeholder="https://image.com/product.jpg"
              style={styles.input}
            />
          </div>
        </div>

        {/* Category */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Category</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🗂️</span>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={onChange}
              style={{ ...styles.input, cursor: "pointer" }}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.formActions}>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving..." : editId ? "Update Product 💕" : "Create Product 🌸"}
          </button>
          <button type="button" onClick={onCancel} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  formCard: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "36px 40px",
    boxShadow: "0 20px 60px rgba(244,143,177,0.2)",
    border: "1.5px solid rgba(248,187,208,0.5)",
    marginBottom: "36px",
    fontFamily: "'Poppins', sans-serif",
  },
  formTitle: { fontSize: "22px", fontWeight: "700", color: "#e91e8c", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  row: { display: "flex", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "13px", fontWeight: "600", color: "#c2185b", paddingLeft: "4px" },
  optional: { color: "#f48fb1", fontWeight: "400" },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    padding: "0 14px",
  },
  icon: { fontSize: "16px", marginRight: "10px", flexShrink: 0 },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "13px 0",
    fontSize: "14px",
    color: "#444",
    outline: "none",
    fontFamily: "'Poppins', sans-serif",
  },
  formActions: { display: "flex", gap: "12px", marginTop: "4px" },
  submitBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "13px 28px",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
  },
  cancelBtn: {
    background: "#fff",
    color: "#c2185b",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    padding: "13px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
  },
};