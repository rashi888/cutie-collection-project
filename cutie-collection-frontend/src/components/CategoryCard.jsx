export default function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={styles.emoji}>🏷️</span>
        <div style={styles.actions}>
          {onEdit && (
            <button style={styles.editBtn} onClick={() => onEdit(category)}>
              ✏️
            </button>
          )}
          {onDelete && (
            <button style={styles.deleteBtn} onClick={() => onDelete(category.id)}>
              🗑️
            </button>
          )}
        </div>
      </div>

      <h3 style={styles.name}>{category.name}</h3>

      {category.description && (
        <p style={styles.desc}>{category.description}</p>
      )}

      <div style={styles.footer}>
        <span style={styles.activeBadge}>✅ Active</span>
        {category.createdAt && (
          <span style={styles.date}>
            {new Date(category.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    border: "1.5px solid #f8bbd0",
    boxShadow: "0 4px 20px rgba(244,143,177,0.1)",
    fontFamily: "'Poppins', sans-serif",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  emoji: { fontSize: "32px" },
  actions: { display: "flex", gap: "8px" },
  editBtn: {
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "10px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "15px",
  },
  deleteBtn: {
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "10px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "15px",
  },
  name: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    marginBottom: "8px",
  },
  desc: {
    fontSize: "13px",
    color: "#888",
    lineHeight: "1.5",
    marginBottom: "14px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #fce4ec",
  },
  activeBadge: {
    background: "#f0fff4",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
    borderRadius: "8px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "600",
  },
  date: { fontSize: "11px", color: "#bbb" },
};