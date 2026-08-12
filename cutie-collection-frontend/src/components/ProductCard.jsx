import { memo, useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
  onActivate,
  onAddToCart,
  onAddToWishlist,
  isInCart = false,
  isInWishlist = false,
}) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(isInCart);
  const [imageError, setImageError] = useState(false);

  const navigate = useNavigate();

  const isAdminMode = Boolean(onEdit || onDelete || onActivate);

  const unavailable =
    product.active === false ||
    product.inStock === false ||
    Number(product.stockQuantity) <= 0;

  useEffect(() => {
    setAdded(isInCart);
    setAdding(false);
  }, [isInCart]);

  useEffect(() => {
    setImageError(false);
  }, [product.imageUrl]);

  const handleAddToCart = useCallback(
    async (event) => {
      event.stopPropagation();

      if (adding || unavailable || !onAddToCart) {
        return;
      }

      try {
        setAdding(true);

        await onAddToCart(product);

        setAdded(true);
      } finally {
        setAdding(false);
      }
    },
    [adding, unavailable, onAddToCart, product],
  );
  const handleCardKeyDown = useCallback(
    (event) => {
      if (!isAdminMode && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();

        navigate(`/products/${product.id}`);
      }
    },
    [isAdminMode, navigate, product.id],
  );

  const handleWishlist = useCallback(
    async (event) => {
      event.stopPropagation();

      if (unavailable || !onAddToWishlist) {
        return;
      }

      try {
        await onAddToWishlist(product);
      } catch {
        /*
         * The parent page should display
         * the API error notification.
         */
      }
    },
    [unavailable, onAddToWishlist, product],
  );

  const handleGoToCart = useCallback(
    (event) => {
      event.stopPropagation();
      navigate("/cart");
    },
    [navigate],
  );

  const handleCardClick = useCallback(() => {
    if (!isAdminMode) {
      navigate(`/products/${product.id}`);
    }
  }, [isAdminMode, navigate, product.id]);

  const formattedPrice = Number(product.price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <article
      className="product-card"
      style={{
        ...styles.card,
        cursor: isAdminMode ? "default" : "pointer",
        opacity: product.active === false ? 0.72 : 1,
      }}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={isAdminMode ? undefined : 0}
      role={isAdminMode ? undefined : "link"}
    >
      {/* Product Image */}
      <div style={styles.imageBox}>
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={styles.image}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <span style={styles.imagePlaceholder} aria-hidden="true">
            🛍️
          </span>
        )}

        {product.active === false && (
          <span style={styles.inactiveOverlay}>Inactive</span>
        )}
      </div>

      {/* Category */}
      {product.categoryName && (
        <span style={styles.categoryBadge}>{product.categoryName}</span>
      )}

      {/* Product Name */}
      <h3 style={styles.name}>{product.name}</h3>

      {/* Description */}
      {product.description && (
        <p style={styles.description}>{product.description}</p>
      )}

      {/* Price and Stock */}
      <div style={styles.priceRow}>
        <span style={styles.price}>₹{formattedPrice}</span>

        <span style={unavailable ? styles.outOfStock : styles.inStock}>
          {product.active === false
            ? "Unavailable"
            : unavailable
              ? "Out of Stock"
              : `Stock: ${product.stockQuantity}`}
        </span>
      </div>

      {/* Customer Actions */}
      {!isAdminMode && onAddToCart && (
        <div style={styles.buttonRow}>
          {!added ? (
            <button
              type="button"
              className="shop-btn"
              style={{
                ...styles.addToCartButton,
                opacity: unavailable || adding ? 0.55 : 1,
                cursor: unavailable || adding ? "not-allowed" : "pointer",
              }}
              onClick={handleAddToCart}
              disabled={unavailable || adding}
            >
              {adding
                ? "Adding... 🌸"
                : unavailable
                  ? "Out of Stock"
                  : "🛒 Add to Cart"}
            </button>
          ) : (
            <button
              type="button"
              className="go-to-cart-btn"
              style={styles.goToCartButton}
              onClick={handleGoToCart}
            >
              ✅ Go to Cart →
            </button>
          )}

          {onAddToWishlist && (
            <button
              type="button"
              className="wishlist-btn"
              style={{
                ...styles.wishlistButton,
                opacity: unavailable ? 0.5 : 1,
                cursor: unavailable ? "not-allowed" : "pointer",
              }}
              onClick={handleWishlist}
              disabled={unavailable}
              aria-label={
                isInWishlist
                  ? `Remove ${product.name} from wishlist`
                  : `Add ${product.name} to wishlist`
              }
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist ? "❤️" : "🤍"}
            </button>
          )}
        </div>
      )}

      {/* Administrator Actions */}
      {isAdminMode && (
        <div style={styles.actions}>
          {onEdit && (
            <button
              type="button"
              style={styles.editButton}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(product);
              }}
            >
              ✏️ Edit
            </button>
          )}

          {product.active === false && onActivate && (
            <button
              type="button"
              style={styles.activateButton}
              onClick={(event) => {
                event.stopPropagation();
                onActivate(product.id);
              }}
            >
              ▶️ Activate
            </button>
          )}

          {product.active !== false && onDelete && (
            <button
              type="button"
              style={styles.deleteButton}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(product.id);
              }}
            >
              ⏸️ Deactivate
            </button>
          )}
        </div>
      )}
    </article>
  );
});

export default ProductCard;

const styles = {
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 8px 32px rgba(244,143,177,0.18)",
    backdropFilter: "blur(20px)",
    fontFamily: "'Poppins', sans-serif",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },

  imageBox: {
    position: "relative",
    display: "flex",
    height: "180px",
    marginBottom: "4px",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #fce4ec",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: "18px",
    objectFit: "cover",
  },

  imagePlaceholder: {
    fontSize: "64px",
    lineHeight: 1,
  },

  inactiveOverlay: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "5px 11px",
    borderRadius: "999px",
    background: "rgba(198, 40, 40, 0.9)",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "700",
  },

  categoryBadge: {
    alignSelf: "flex-start",
    padding: "4px 14px",
    border: "1px solid #f8bbd0",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    color: "#c2185b",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.3px",
  },

  name: {
    margin: 0,
    color: "#2d2d2d",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: "1.4",
  },

  description: {
    display: "-webkit-box",
    margin: 0,
    overflow: "hidden",
    color: "#9f5575",
    fontSize: "12px",
    lineHeight: "1.6",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
  },

  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "6px",
    paddingTop: "12px",
    borderTop: "1.5px solid #fce4ec",
  },

  price: {
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "800",
  },

  inStock: {
    padding: "4px 10px",
    border: "1px solid #c8e6c9",
    borderRadius: "20px",
    background: "#f0fff4",
    color: "#2e7d32",
    fontSize: "10px",
    fontWeight: "600",
  },

  outOfStock: {
    padding: "4px 10px",
    border: "1px solid #ffcdd2",
    borderRadius: "20px",
    background: "#fff5f5",
    color: "#c62828",
    fontSize: "10px",
    fontWeight: "600",
  },

  buttonRow: {
    display: "flex",
    width: "100%",
    gap: "10px",
    marginTop: "4px",
  },

  addToCartButton: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
    color: "#ffffff",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px",
    fontWeight: "700",
  },

  goToCartButton: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #43a047, #2e7d32)",
    boxShadow: "0 6px 20px rgba(46,125,50,0.3)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "13px",
    fontWeight: "700",
  },

  wishlistButton: {
    flexShrink: 0,
    padding: "10px 14px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    background: "#fff5f8",
    color: "#e91e8c",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "17px",
  },

  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "4px",
    flexWrap: "wrap",
  },

  editButton: {
    flex: 1,
    minWidth: "85px",
    padding: "10px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    color: "#c2185b",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    minWidth: "100px",
    padding: "10px",
    border: "1.5px solid #ffcdd2",
    borderRadius: "12px",
    background: "#fff5f5",
    color: "#c62828",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    fontWeight: "600",
  },

  activateButton: {
    flex: 1,
    minWidth: "100px",
    padding: "10px",
    border: "1.5px solid #c8e6c9",
    borderRadius: "12px",
    background: "#f0fff4",
    color: "#2e7d32",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "12px",
    fontWeight: "600",
  },
};
