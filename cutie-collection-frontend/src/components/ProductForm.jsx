export default function ProductForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  editId = null,
  categories = [],
}) {
  const activeCategories = categories.filter(
    (category) => category.active !== false
  );

  return (
    <div style={styles.formCard}>
      <h2 style={styles.formTitle}>
        {editId
          ? "✏️ Edit Product"
          : "🛍️ New Product"}
      </h2>

      <form
        onSubmit={onSubmit}
        style={styles.form}
      >
        {/* Product Name */}
        <div style={styles.inputGroup}>
          <label
            htmlFor="product-name"
            style={styles.label}
          >
            Product Name
          </label>

          <div style={styles.inputWrapper}>
            <span
              style={styles.icon}
              aria-hidden="true"
            >
              🏷️
            </span>

            <input
              id="product-name"
              type="text"
              name="name"
              value={form.name ?? ""}
              onChange={onChange}
              placeholder="e.g. Cute Teddy Bear"
              minLength={2}
              maxLength={255}
              required
              disabled={loading}
              style={styles.input}
            />
          </div>
        </div>

        {/* Description */}
        <div style={styles.inputGroup}>
          <label
            htmlFor="product-description"
            style={styles.label}
          >
            Description{" "}
            <span style={styles.optional}>
              (optional)
            </span>
          </label>

          <div
            style={{
              ...styles.inputWrapper,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                ...styles.icon,
                marginTop: "14px",
              }}
              aria-hidden="true"
            >
              📝
            </span>

            <textarea
              id="product-description"
              name="description"
              value={form.description ?? ""}
              onChange={onChange}
              placeholder="Describe the product..."
              rows={4}
              maxLength={5000}
              disabled={loading}
              style={styles.textarea}
            />
          </div>

          <span style={styles.characterCount}>
            {(form.description ?? "").length}/5000
          </span>
        </div>

        {/* Price and Stock */}
        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label
              htmlFor="product-price"
              style={styles.label}
            >
              Price (₹)
            </label>

            <div style={styles.inputWrapper}>
              <span
                style={styles.icon}
                aria-hidden="true"
              >
                💰
              </span>

              <input
                id="product-price"
                type="number"
                name="price"
                value={form.price ?? ""}
                onChange={onChange}
                placeholder="0.00"
                min="0.01"
                max="9999999999.99"
                step="0.01"
                required
                disabled={loading}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label
              htmlFor="product-stock"
              style={styles.label}
            >
              Stock Quantity
            </label>

            <div style={styles.inputWrapper}>
              <span
                style={styles.icon}
                aria-hidden="true"
              >
                📦
              </span>

              <input
                id="product-stock"
                type="number"
                name="stockQuantity"
                value={form.stockQuantity ?? ""}
                onChange={onChange}
                placeholder="0"
                min="0"
                step="1"
                required
                disabled={loading}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div style={styles.inputGroup}>
          <label
            htmlFor="product-image-url"
            style={styles.label}
          >
            Image URL{" "}
            <span style={styles.optional}>
              (optional)
            </span>
          </label>

          <div style={styles.inputWrapper}>
            <span
              style={styles.icon}
              aria-hidden="true"
            >
              🖼️
            </span>

            <input
              id="product-image-url"
              type="url"
              name="imageUrl"
              value={form.imageUrl ?? ""}
              onChange={onChange}
              placeholder="https://example.com/product.jpg"
              maxLength={1000}
              disabled={loading}
              style={styles.input}
            />
          </div>
        </div>

        {/* Category */}
        <div style={styles.inputGroup}>
          <label
            htmlFor="product-category"
            style={styles.label}
          >
            Category
          </label>

          <div style={styles.inputWrapper}>
            <span
              style={styles.icon}
              aria-hidden="true"
            >
              🗂️
            </span>

            <select
              id="product-category"
              name="categoryId"
              value={form.categoryId ?? ""}
              onChange={onChange}
              required
              disabled={loading}
              style={{
                ...styles.input,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              <option value="">
                Select a category...
              </option>

              {activeCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {activeCategories.length === 0 && (
            <span style={styles.warning}>
              No active categories are available.
              Create or activate a category first.
            </span>
          )}
        </div>

        {/* Buttons */}
        <div style={styles.formActions}>
          <button
            type="submit"
            disabled={
              loading ||
              activeCategories.length === 0
            }
            style={{
              ...styles.submitBtn,
              opacity:
                loading ||
                activeCategories.length === 0
                  ? 0.65
                  : 1,
              cursor:
                loading ||
                activeCategories.length === 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "Saving..."
              : editId
                ? "Update Product 💕"
                : "Create Product 🌸"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              ...styles.cancelBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  formCard: {
    marginBottom: "36px",
    padding: "36px 40px",
    border:
      "1.5px solid rgba(248,187,208,0.5)",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.95)",
    boxShadow:
      "0 20px 60px rgba(244,143,177,0.2)",
    backdropFilter: "blur(20px)",
    fontFamily: "'Poppins', sans-serif",
  },

  formTitle: {
    margin: "0 0 24px",
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "700",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  row: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  inputGroup: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    paddingLeft: "4px",
    color: "#c2185b",
    fontSize: "13px",
    fontWeight: "600",
  },

  optional: {
    color: "#a86b83",
    fontWeight: "400",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    background: "#fff5f8",
  },

  icon: {
    flexShrink: 0,
    marginRight: "10px",
    fontSize: "16px",
  },

  input: {
    minWidth: 0,
    flex: 1,
    padding: "13px 0",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#444444",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
  },

  textarea: {
    minHeight: "95px",
    flex: 1,
    padding: "13px 0",
    border: "none",
    outline: "none",
    resize: "vertical",
    background: "transparent",
    color: "#444444",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  characterCount: {
    alignSelf: "flex-end",
    color: "#777777",
    fontSize: "11px",
  },

  warning: {
    color: "#9a6200",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "4px",
    flexWrap: "wrap",
  },

  submitBtn: {
    padding: "13px 28px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 6px 20px rgba(233,30,140,0.3)",
    color: "#ffffff",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    fontWeight: "600",
  },

  cancelBtn: {
    padding: "13px 24px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#c2185b",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "14px",
    fontWeight: "600",
  },
};