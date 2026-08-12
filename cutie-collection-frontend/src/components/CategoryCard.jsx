export default function CategoryCard({
  category,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}) {
  const isActive =
    category.active !== false;

  const formattedDate =
    category.createdAt
      ? new Date(
          category.createdAt
        ).toLocaleDateString("en-IN")
      : null;

  return (
    <article
      style={{
        ...styles.card,
        opacity: isActive ? 1 : 0.72,
      }}
    >
      <div style={styles.cardTop}>
        <span
          style={styles.emoji}
          aria-hidden="true"
        >
          🏷️
        </span>

        <div style={styles.actions}>
          {onEdit && (
            <button
              type="button"
              style={styles.editBtn}
              onClick={() =>
                onEdit(category)
              }
              title="Edit category"
              aria-label={`Edit ${category.name}`}
            >
              ✏️
            </button>
          )}

          {isActive && onDeactivate && (
            <button
              type="button"
              style={styles.deactivateBtn}
              onClick={() =>
                onDeactivate(category.id)
              }
              title="Deactivate category"
              aria-label={`Deactivate ${category.name}`}
            >
              ⏸️
            </button>
          )}

          {!isActive && onActivate && (
            <button
              type="button"
              style={styles.activateBtn}
              onClick={() =>
                onActivate(category.id)
              }
              title="Activate category"
              aria-label={`Activate ${category.name}`}
            >
              ▶️
            </button>
          )}

          {isActive && onDelete && (
            <button
              type="button"
              style={styles.deleteBtn}
              onClick={() =>
                onDelete(category.id)
              }
              title="Delete category"
              aria-label={`Delete ${category.name}`}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <h3 style={styles.name}>
        {category.name}
      </h3>

      {category.description ? (
        <p style={styles.description}>
          {category.description}
        </p>
      ) : (
        <p style={styles.emptyDescription}>
          No description available
        </p>
      )}

      <div style={styles.footer}>
        <span
          style={
            isActive
              ? styles.activeBadge
              : styles.inactiveBadge
          }
        >
          {isActive
            ? "✅ Active"
            : "⏸️ Inactive"}
        </span>

        {formattedDate && (
          <span style={styles.date}>
            Created {formattedDate}
          </span>
        )}
      </div>
    </article>
  );
}

const styles = {
  card: {
    display: "flex",
    minHeight: "210px",
    flexDirection: "column",
    padding: "24px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    boxShadow:
      "0 4px 20px rgba(244,143,177,0.1)",
    fontFamily: "'Poppins', sans-serif",
    transition:
      "opacity 0.2s ease, box-shadow 0.2s ease",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  },

  emoji: {
    fontSize: "32px",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  editBtn: {
    padding: "6px 10px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "10px",
    background: "#fff5f8",
    cursor: "pointer",
    fontSize: "15px",
  },

  activateBtn: {
    padding: "6px 10px",
    border: "1.5px solid #c8e6c9",
    borderRadius: "10px",
    background: "#f0fff4",
    cursor: "pointer",
    fontSize: "15px",
  },

  deactivateBtn: {
    padding: "6px 10px",
    border: "1.5px solid #ffe082",
    borderRadius: "10px",
    background: "#fff8e1",
    cursor: "pointer",
    fontSize: "15px",
  },

  deleteBtn: {
    padding: "6px 10px",
    border: "1.5px solid #ffcdd2",
    borderRadius: "10px",
    background: "#fff5f5",
    cursor: "pointer",
    fontSize: "15px",
  },

  name: {
    margin: "0 0 8px",
    color: "#333333",
    fontSize: "16px",
    fontWeight: "700",
  },

  description: {
    display: "-webkit-box",
    margin: "0 0 14px",
    overflow: "hidden",
    color: "#777777",
    fontSize: "13px",
    lineHeight: "1.6",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
  },

  emptyDescription: {
    margin: "0 0 14px",
    color: "#999999",
    fontSize: "12px",
    fontStyle: "italic",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid #fce4ec",
    flexWrap: "wrap",
  },

  activeBadge: {
    padding: "3px 10px",
    border: "1px solid #c8e6c9",
    borderRadius: "8px",
    background: "#f0fff4",
    color: "#2e7d32",
    fontSize: "11px",
    fontWeight: "600",
  },

  inactiveBadge: {
    padding: "3px 10px",
    border: "1px solid #ffcdd2",
    borderRadius: "8px",
    background: "#fff5f5",
    color: "#c62828",
    fontSize: "11px",
    fontWeight: "600",
  },

  date: {
    color: "#888888",
    fontSize: "10px",
  },
};