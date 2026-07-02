import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  onAddToCart,
  onAddToWishlist,
}) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const isAdminMode = onEdit || onDelete;

  const handleAddToCart = useCallback(
    async (e) => {
      e.stopPropagation();
      if (adding || product.stockQuantity <= 0) return;
      setAdding(true);
      await onAddToCart(product);
      setAdding(false);
      setAdded(true);
    },
    [adding, product, onAddToCart],
  );

  const handleWishlist = useCallback(
    (e) => {
      e.stopPropagation();
      onAddToWishlist?.(product);
    },
    [product, onAddToWishlist],
  );

  const handleGoToCart = useCallback(
    (e) => {
      e.stopPropagation();
      navigate("/cart");
    },
    [navigate],
  );

  const handleCardClick = useCallback(() => {
    if (!isAdminMode) navigate(`/products/${product.id}`);
  }, [isAdminMode, navigate, product.id]);

  const outOfStock = product.stockQuantity <= 0;

  return (
    <div className="product-card" style={S.card} onClick={handleCardClick}>
      {/* ── Image ── */}
      <div style={S.imageBox}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "12px",
            }}
            // style={S.image}
            loading="lazy"
          />
        ) : (
          <span style={S.imagePlaceholder}>🛍️</span>
        )}
      </div>

      {/* ── Category badge ── */}
      {product.categoryName && (
        <span style={S.categoryBadge}>{product.categoryName}</span>
      )}

      {/* ── Name ── */}
      <h3 style={S.name}>{product.name}</h3>

      {/* ── Description ── */}
      {product.description && <p style={S.desc}>{product.description}</p>}

      {/* ── Price & Stock ── */}
      <div style={S.priceRow}>
        <span style={S.price}>₹{product.price}</span>
        <span style={outOfStock ? S.outStock : S.inStock}>
          {outOfStock ? "Out of Stock" : `Stock: ${product.stockQuantity}`}
        </span>
      </div>

      {/* ── USER MODE ── */}
      {!isAdminMode && onAddToCart && (
        <div style={S.btnRow}>
          {/* Flipkart: Add to Cart → Go to Cart */}
          {!added ? (
            <button
              className="shop-btn"
              style={
                outOfStock
                  ? { ...S.addToCartBtn, opacity: 0.5, cursor: "not-allowed" }
                  : adding
                    ? { ...S.addToCartBtn, opacity: 0.75 }
                    : S.addToCartBtn
              }
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
            >
              {adding ? "Adding... 🌸" : "🛒 Add to Cart"}
            </button>
          ) : (
            <button
              className="go-to-cart-btn"
              style={S.goToCartBtn}
              onClick={handleGoToCart}
            >
              ✅ Go to Cart →
            </button>
          )}

          {/* Wishlist */}
          <button
            className="wishlist-btn"
            style={S.wishlistBtn}
            onClick={handleWishlist}
          >
            💖
          </button>
        </div>
      )}

      {/* ── ADMIN MODE ── */}
      {isAdminMode && (
        <div style={S.actions}>
          {onEdit && (
            <button
              style={S.editBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
            >
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button
              style={S.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default ProductCard;

/* ─────────────────────────── STYLES ─────────────────────────── */
const S = {
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
    cursor: "pointer",
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
  desc: {
    fontSize: "12px",
    color: "#f48fb1",
    lineHeight: "1.6",
    margin: 0,
    // Clamp to 2 lines to keep card heights consistent
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

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

  btnRow: {
    display: "flex",
    gap: "10px",
    width: "100%",
    marginTop: "4px",
  },

  // Pink — Add to Cart
  addToCartBtn: {
    flex: 1,
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
    letterSpacing: "0.3px",
    transition:
      "transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease",
  },

  // Green — Go to Cart (Flipkart style)
  goToCartBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #43a047, #2e7d32)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "13px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
    letterSpacing: "0.3px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    animation: "fadeInUp 0.25s ease",
  },

  // Wishlist (heart only — compact)
  wishlistBtn: {
    background: "#fff5f8",
    color: "#e91e8c",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "16px",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "background 0.2s, border-color 0.2s, transform 0.15s",
    flexShrink: 0,
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
};
