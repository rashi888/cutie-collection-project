import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import CartService from "../api/CartService";
import ProductService from "../api/ProductService";
import ReviewService from "../api/ReviewService";
import WishlistService from "../api/WishlistService";

import {
  showError,
  showSuccess,
  showWarning,
} from "../utils/toastUtils";

const INITIAL_REVIEW = {
  rating: 5,
  comment: "",
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const productId = Number(id);

  const [product, setProduct] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true);

  const [adding, setAdding] =
    useState(false);

  const [added, setAdded] =
    useState(false);

  const [wishlisted, setWishlisted] =
    useState(false);

  const [
    wishlistLoading,
    setWishlistLoading,
  ] = useState(false);

  const [
    submittingReview,
    setSubmittingReview,
  ] = useState(false);

  const [imageError, setImageError] =
    useState(false);

  const [imgHovered, setImgHovered] =
    useState(false);

  const [review, setReview] =
    useState(INITIAL_REVIEW);

  const token =
    localStorage.getItem("token");

  const isAuthenticated =
    Boolean(token);

  const formattedPrice = useMemo(
    () =>
      Number(
        product?.price || 0
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [product?.price]
  );

  const unavailable =
    product?.active === false ||
    product?.inStock === false ||
    Number(
      product?.stockQuantity || 0
    ) <= 0;

  const loadProduct = useCallback(
    async () => {
      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        showError(
          "The requested product ID is invalid"
        );

        navigate("/products", {
          replace: true,
        });

        return;
      }

      try {
        setLoading(true);

        const response =
          await ProductService.getById(
            productId
          );

        setProduct(response.data);
        setImageError(false);
      } catch (error) {
        setProduct(null);

        showError(
          error,
          "Product not found"
        );

        navigate("/products", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [navigate, productId]
  );

  const loadReviews = useCallback(
    async () => {
      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        return;
      }

      try {
        setReviewsLoading(true);

        const response =
          await ReviewService
            .getReviewsByProduct(
              productId
            );

        const loadedReviews =
          Array.isArray(response.data)
            ? response.data
            : [];

        setReviews(
          [...loadedReviews].sort(
            (
              firstReview,
              secondReview
            ) =>
              new Date(
                secondReview.createdAt ||
                  0
              ) -
              new Date(
                firstReview.createdAt ||
                  0
              )
          )
        );
      } catch (error) {
        setReviews([]);

        showError(
          error,
          "Unable to load reviews"
        );
      } finally {
        setReviewsLoading(false);
      }
    },
    [productId]
  );

  const loadCustomerState =
    useCallback(async () => {
      if (!isAuthenticated) {
        setAdded(false);
        setWishlisted(false);
        return;
      }

      try {
        const [
          cartResponse,
          wishlistResponse,
        ] = await Promise.all([
          CartService.getCart(),
          WishlistService.getWishlist(),
        ]);

        const cartItems =
          Array.isArray(
            cartResponse.data
          )
            ? cartResponse.data
            : [];

        const wishlistItems =
          Array.isArray(
            wishlistResponse.data
          )
            ? wishlistResponse.data
            : [];

        setAdded(
          cartItems.some(
            (item) =>
              Number(item.productId) ===
              productId
          )
        );

        setWishlisted(
          wishlistItems.some(
            (item) =>
              Number(item.productId) ===
              productId
          )
        );
      } catch (error) {
        console.error(
          "Unable to load cart and wishlist state:",
          error
        );
      }
    }, [isAuthenticated, productId]);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [loadProduct, loadReviews]);

  useEffect(() => {
    loadCustomerState();
  }, [loadCustomerState]);

  const requireAuthentication = (
    destination
  ) => {
    if (isAuthenticated) {
      return true;
    }

    navigate("/login", {
      state: {
        from:
          destination ||
          `/products/${productId}`,
      },
    });

    return false;
  };

  const handleAddToCart =
    useCallback(async () => {
      if (
        adding ||
        unavailable ||
        !product
      ) {
        return false;
      }

      if (
        !requireAuthentication(
          `/products/${productId}`
        )
      ) {
        return false;
      }

      try {
        setAdding(true);

        await CartService.addItem({
          productId: Number(product.id),
          quantity: 1,
        });

        setAdded(true);

        showSuccess(
          `${product.name} added to cart`
        );

        return true;
      } catch (error) {
        showError(
          error,
          "Unable to add the product to cart"
        );

        return false;
      } finally {
        setAdding(false);
      }
    }, [
      adding,
      unavailable,
      product,
      isAuthenticated,
      navigate,
      productId,
    ]);

  const handleWishlist =
    useCallback(async () => {
      if (
        !product ||
        unavailable ||
        wishlistLoading
      ) {
        return;
      }

      if (
        !requireAuthentication(
          `/products/${productId}`
        )
      ) {
        return;
      }

      const normalizedProductId =
        Number(product.id);

      try {
        setWishlistLoading(true);

        if (wishlisted) {
          await WishlistService
            .removeFromWishlist(
              normalizedProductId
            );

          setWishlisted(false);

          showSuccess(
            "Product removed from wishlist"
          );
        } else {
          await WishlistService
            .addToWishlist(
              normalizedProductId
            );

          setWishlisted(true);

          showSuccess(
            "Product added to wishlist"
          );
        }
      } catch (error) {
        showError(
          error,
          "Unable to update the wishlist"
        );
      } finally {
        setWishlistLoading(false);
      }
    }, [
      product,
      unavailable,
      wishlistLoading,
      wishlisted,
      isAuthenticated,
      navigate,
      productId,
    ]);

  const handleBuyNow = async () => {
    if (unavailable || adding) {
      return;
    }

    if (
      !requireAuthentication(
        `/products/${productId}`
      )
    ) {
      return;
    }

    if (!added) {
      const addSucceeded =
        await handleAddToCart();

      if (!addSucceeded) {
        return;
      }
    }

    navigate("/checkout");
  };

  const submitReview = async (
    event
  ) => {
    event.preventDefault();

    if (
      !requireAuthentication(
        `/products/${productId}`
      )
    ) {
      return;
    }

    const normalizedComment =
      review.comment.trim();

    if (
      !Number.isInteger(review.rating) ||
      review.rating < 1 ||
      review.rating > 5
    ) {
      showWarning(
        "Rating must be between 1 and 5"
      );

      return;
    }

    if (!normalizedComment) {
      showWarning(
        "Please write a review comment"
      );

      return;
    }

    if (normalizedComment.length > 1000) {
      showWarning(
        "Review comment cannot exceed 1000 characters"
      );

      return;
    }

    try {
      setSubmittingReview(true);

      await ReviewService.addReview(
        productId,
        {
          rating: Number(
            review.rating
          ),
          comment: normalizedComment,
        }
      );

      setReview(INITIAL_REVIEW);

      await loadReviews();

      showSuccess(
        "Review submitted successfully"
      );
    } catch (error) {
      showError(
        error,
        "Unable to submit the review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem(
      "username"
    );

    navigate("/login", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <div style={S.page}>
        <style>{keyframes}</style>

        <div
          style={S.loadingBox}
          role="status"
        >
          <span
            style={S.loadingSpinner}
            aria-hidden="true"
          >
            🌸
          </span>

          <p style={S.loadingText}>
            Loading product...
          </p>

          <div style={S.loadingDots}>
            <span
              style={{
                ...S.dot,
                animationDelay: "0s",
              }}
            />

            <span
              style={{
                ...S.dot,
                animationDelay: "0.2s",
              }}
            />

            <span
              style={{
                ...S.dot,
                animationDelay: "0.4s",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div style={S.page}>
      <style>{keyframes}</style>

      {/* Navigation */}
      <nav style={S.navbar}>
        <Link
          to="/"
          style={S.brandLink}
        >
          <div style={S.navBrand}>
            <span
              style={S.navLogo}
              aria-hidden="true"
            >
              🌸
            </span>

            <span style={S.navTitle}>
              Cutie Collection
            </span>
          </div>
        </Link>

        <div style={S.navLinks}>
          <Link
            to="/"
            style={S.navLink}
          >
            Home
          </Link>

          <Link
            to="/categories"
            style={S.navLink}
          >
            Categories
          </Link>

          <Link
            to="/products"
            style={{
              ...S.navLink,
              ...S.navLinkActive,
            }}
          >
            Products
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/wishlist"
                style={S.navLink}
              >
                💖 Wishlist
              </Link>

              <Link
                to="/cart"
                style={S.navLink}
              >
                🛒 Cart
              </Link>

              <Link
                to="/orders"
                style={S.navLink}
              >
                📦 Orders
              </Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            style={S.logoutBtn}
            className="pdp-logout"
          >
            🌸 Logout
          </button>
        ) : (
          <Link
            to="/login"
            style={S.loginLink}
          >
            Login
          </Link>
        )}
      </nav>

      {/* Breadcrumb */}
      <div style={S.breadcrumb}>
        <Link
          to="/"
          style={S.breadcrumbLink}
          className="pdp-breadcrumb-a"
        >
          Home
        </Link>

        <span style={S.breadcrumbSep}>
          ›
        </span>

        <Link
          to="/products"
          style={S.breadcrumbLink}
          className="pdp-breadcrumb-a"
        >
          Products
        </Link>

        <span style={S.breadcrumbSep}>
          ›
        </span>

        <span style={S.breadcrumbCurrent}>
          {product.name}
        </span>
      </div>

      {/* Product details */}
      <main style={S.container}>
        <div style={S.layout}>
          <section style={S.imageSection}>
            <div
              style={{
                ...S.imageBox,
                boxShadow: imgHovered
                  ? "0 20px 60px rgba(244,143,177,0.38)"
                  : "0 12px 40px rgba(244,143,177,0.2)",
              }}
              onMouseEnter={() =>
                setImgHovered(true)
              }
              onMouseLeave={() =>
                setImgHovered(false)
              }
            >
              {product.imageUrl && !imageError ? (
  <img
    src={product.imageUrl}
    alt={product.name || "Product"}   onError={() => setImageError(true)}
  />
) : (
  <div style={S.imageFallback}>
    <span
      style={{ fontSize: "100px" }}
      aria-hidden="true"
    >
      🛍️
    </span>
  </div>
)}
            </div>

            {product.categoryName && (
              <div style={S.categoryBadge}>
                {product.categoryName}
              </div>
            )}

            <div
              style={
                unavailable
                  ? S.stockTagOut
                  : S.stockTagIn
              }
            >
              {product.active === false
                ? "❌ Product Unavailable"
                : unavailable
                  ? "❌ Out of Stock"
                  : `✅ ${product.stockQuantity} available`}
            </div>
          </section>

          <section style={S.detailsSection}>
            <h1 style={S.productName}>
              {product.name}
            </h1>

            <div style={S.priceRow}>
              <span style={S.price}>
                ₹{formattedPrice}
              </span>

              <div
                style={S.secureCheckoutTag}
              >
                🔒 Secure Checkout
              </div>
            </div>

            <p style={S.priceSub}>
              Final price and stock are
              revalidated securely during
              order placement.
            </p>

            <div style={S.divider} />

            {product.description && (
              <div style={S.descBox}>
                <h3 style={S.descTitle}>
                  📝 Description
                </h3>

                <p style={S.desc}>
                  {product.description}
                </p>
              </div>
            )}

            <div style={S.highlights}>
              {HIGHLIGHTS.map(
                (highlight) => (
                  <div
                    key={highlight.title}
                    style={S.highlight}
                    className="pdp-highlight-row"
                  >
                    <span
                      style={
                        S.highlightIcon
                      }
                      aria-hidden="true"
                    >
                      {highlight.icon}
                    </span>

                    <div>
                      <div
                        style={
                          S.highlightTitle
                        }
                      >
                        {highlight.title}
                      </div>

                      <div
                        style={
                          S.highlightSub
                        }
                      >
                        {highlight.sub}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div style={S.divider} />

            <div style={S.actions}>
              {!added ? (
                <button
                  type="button"
                  className="pdp-cart-btn"
                  style={{
                    ...S.addToCartBtn,
                    opacity:
                      unavailable || adding
                        ? 0.5
                        : 1,
                    cursor:
                      unavailable || adding
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onClick={handleAddToCart}
                  disabled={
                    unavailable || adding
                  }
                >
                  {adding
                    ? "Adding... 🌸"
                    : unavailable
                      ? "Unavailable"
                      : "🛒 Add to Cart"}
                </button>
              ) : (
                <button
                  type="button"
                  style={S.goToCartBtn}
                  onClick={() =>
                    navigate("/cart")
                  }
                >
                  ✅ Go to Cart →
                </button>
              )}

              <button
                type="button"
                className="pdp-wishlist-btn"
                style={
                  wishlisted
                    ? S.wishlistBtnActive
                    : S.wishlistBtn
                }
                onClick={handleWishlist}
                disabled={
                  wishlistLoading ||
                  unavailable
                }
                aria-label={
                  wishlisted
                    ? "Remove product from wishlist"
                    : "Add product to wishlist"
                }
              >
                {wishlistLoading
                  ? "⏳"
                  : wishlisted
                    ? "❤️"
                    : "🤍"}
              </button>
            </div>

            {!unavailable && (
              <button
                type="button"
                className="pdp-buynow-btn"
                style={S.buyNowBtn}
                onClick={handleBuyNow}
                disabled={adding}
              >
                ⚡ Buy Now
              </button>
            )}

            <div style={S.trustRow}>
              {TRUST_BADGES.map(
                (trustBadge) => (
                  <span
                    key={trustBadge}
                    style={S.trustBadge}
                  >
                    {trustBadge}
                  </span>
                )
              )}
            </div>

            <Link
              to="/products"
              style={S.backLink}
              className="pdp-back"
            >
              ← Back to Products
            </Link>
          </section>
        </div>
      </main>

      {/* Reviews */}
      <section style={S.reviewsContainer}>
        <div style={S.reviewsCard}>
          <h2 style={S.reviewsTitle}>
            ⭐ Reviews & Ratings
          </h2>

          {isAuthenticated ? (
            <form
              onSubmit={submitReview}
              style={S.reviewForm}
            >
              <h3 style={S.reviewFormTitle}>
                Write a Review 💕
              </h3>

              <label
                htmlFor="review-rating"
                style={S.reviewLabel}
              >
                Rating
              </label>

              <select
                id="review-rating"
                value={review.rating}
                onChange={(event) =>
                  setReview(
                    (currentReview) => ({
                      ...currentReview,
                      rating: Number(
                        event.target.value
                      ),
                    })
                  )
                }
                disabled={submittingReview}
                style={S.reviewInput}
              >
                <option value={5}>
                  ⭐⭐⭐⭐⭐
                </option>

                <option value={4}>
                  ⭐⭐⭐⭐
                </option>

                <option value={3}>
                  ⭐⭐⭐
                </option>

                <option value={2}>
                  ⭐⭐
                </option>

                <option value={1}>
                  ⭐
                </option>
              </select>

              <label
                htmlFor="review-comment"
                style={S.reviewLabel}
              >
                Comment
              </label>

              <textarea
                id="review-comment"
                rows={4}
                placeholder="Write your review"
                value={review.comment}
                onChange={(event) =>
                  setReview(
                    (currentReview) => ({
                      ...currentReview,
                      comment:
                        event.target.value,
                    })
                  )
                }
                maxLength={1000}
                disabled={submittingReview}
                style={S.reviewTextarea}
              />

              <span
                style={
                  S.reviewCharacterCount
                }
              >
                {review.comment.length}/1000
              </span>

              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  ...S.reviewSubmitButton,
                  opacity: submittingReview
                    ? 0.65
                    : 1,
                  cursor: submittingReview
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review 🌸"}
              </button>
            </form>
          ) : (
            <div style={S.reviewLoginBox}>
              <p style={S.reviewLoginText}>
                Sign in to review this
                product.
              </p>

              <Link
                to="/login"
                state={{
                  from: `/products/${productId}`,
                }}
                style={S.reviewLoginLink}
              >
                Login to Write a Review
              </Link>
            </div>
          )}

          <h3 style={S.reviewListTitle}>
            Customer Reviews 💖
          </h3>

          {reviewsLoading ? (
            <p style={S.reviewStatusText}>
              Loading reviews...
            </p>
          ) : reviews.length === 0 ? (
            <p style={S.reviewStatusText}>
              No reviews yet. Be the first
              customer to review this
              product.
            </p>
          ) : (
            reviews.map(
              (savedReview) => (
                <article
                  key={savedReview.id}
                  style={S.reviewItem}
                >
                  <div
                    style={
                      S.reviewItemHeader
                    }
                  >
                    <h4
                      style={
                        S.reviewerName
                      }
                    >
                      {savedReview.userName ||
                        savedReview.reviewerName ||
                        "Verified Customer"}
                    </h4>

                    {savedReview.createdAt && (
                      <span
                        style={
                          S.reviewDate
                        }
                      >
                        {new Date(
                          savedReview.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </span>
                    )}
                  </div>

                  <p style={S.reviewStars}>
                    {"⭐".repeat(
                      Math.max(
                        0,
                        Math.min(
                          5,
                          Number(
                            savedReview.rating ||
                              0
                          )
                        )
                      )
                    )}
                  </p>

                  <p style={S.reviewComment}>
                    {savedReview.comment}
                  </p>
                </article>
              )
            )
          )}
        </div>
      </section>

      <footer style={S.footer}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Cutie
          Collection. Made with 💕 for all
          cuties.
        </p>
      </footer>
    </div>
  );
}

const HIGHLIGHTS = [
  {
    icon: "📦",
    title: "Stock Validation",
    sub: "Availability is checked before ordering",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    sub: "Backend-verified Razorpay checkout",
  },
  {
    icon: "💳",
    title: "Trusted Pricing",
    sub: "Final amount is calculated by the backend",
  },
  {
    icon: "🌸",
    title: "Cutie Collection",
    sub: "Carefully selected products",
  },
];

const TRUST_BADGES = [
  "✅ Product Verified",
  "📦 Stock Checked",
  "💳 Secure Payment",
];

const keyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dotBounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.4;
    }

    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes spinFloat {
    0% {
      transform: rotate(0deg) scale(1);
    }

    50% {
      transform: rotate(180deg) scale(1.15);
    }

    100% {
      transform: rotate(360deg) scale(1);
    }
  }

  .pdp-cart-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(233,30,140,0.45);
  }

  .pdp-wishlist-btn:hover:not(:disabled) {
    background: #fce4ec;
    border-color: #e91e8c;
    transform: scale(1.08);
  }

  .pdp-buynow-btn:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-2px);
  }

  .pdp-highlight-row:hover {
    background: #fce4ec;
    border-color: #f8bbd0;
  }

  .pdp-back:hover,
  .pdp-breadcrumb-a:hover {
    color: #e91e8c;
  }
`;

const S = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#333333",
    fontFamily: "'Poppins', sans-serif",
  },

  loadingBox: {
    display: "flex",
    minHeight: "80vh",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "16px",
  },

  loadingSpinner: {
    display: "block",
    fontSize: "64px",
    animation:
      "spinFloat 1.8s linear infinite",
  },

  loadingText: {
    margin: 0,
    color: "#c85f89",
    fontSize: "16px",
    fontWeight: "500",
  },

  loadingDots: {
    display: "flex",
    gap: "8px",
  },

  dot: {
    display: "inline-block",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    animation:
      "dotBounce 1.2s ease-in-out infinite",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 5%",
    borderBottom: "1.5px solid #fce4ec",
    background: "rgba(255,255,255,0.96)",
    boxShadow:
      "0 2px 16px rgba(244,143,177,0.1)",
    backdropFilter: "blur(12px)",
    flexWrap: "wrap",
  },

  brandLink: {
    color: "inherit",
    textDecoration: "none",
  },

  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  navLogo: {
    fontSize: "28px",
  },

  navTitle: {
    color: "#e91e8c",
    fontSize: "20px",
    fontWeight: "700",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
  },

  navLink: {
    paddingBottom: "3px",
    borderBottom:
      "2px solid transparent",
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  navLinkActive: {
    borderBottom:
      "2px solid #e91e8c",
    color: "#e91e8c",
    fontWeight: "700",
  },

  logoutBtn: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 4px 14px rgba(233,30,140,0.28)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  loginLink: {
    padding: "8px 20px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },

  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 5%",
    borderBottom: "1px solid #fce4ec",
    background:
      "linear-gradient(to right, #fff5f8, #ffffff)",
    fontSize: "13px",
    flexWrap: "wrap",
  },

  breadcrumbLink: {
    color: "#b85d82",
    fontWeight: "500",
    textDecoration: "none",
  },

  breadcrumbSep: {
    color: "#f8bbd0",
  },

  breadcrumbCurrent: {
    color: "#e91e8c",
    fontWeight: "600",
    overflowWrap: "anywhere",
  },

  container: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "48px 0",
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "50px",
    alignItems: "flex-start",
  },

  imageSection: {
    position: "relative",
    minWidth: 0,
  },

  imageBox: {
    display: "flex",
    height: "440px",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #f8bbd0",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
    transition:
      "box-shadow 0.3s ease",
  },

  productImage: {
  width: "100%",
  height: "100%",
  borderRadius: "28px",
  objectFit: "cover",
  transition: "transform 0.4s ease",
},

  imageFallback: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryBadge: {
    position: "absolute",
    top: "16px",
    left: "16px",
    padding: "6px 16px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "700",
  },

  stockTagIn: {
    position: "absolute",
    right: "16px",
    bottom: "16px",
    padding: "5px 14px",
    border: "1.5px solid #c8e6c9",
    borderRadius: "20px",
    background: "#f0fff4",
    color: "#2e7d32",
    fontSize: "11px",
    fontWeight: "700",
  },

  stockTagOut: {
    position: "absolute",
    right: "16px",
    bottom: "16px",
    padding: "5px 14px",
    border: "1.5px solid #ffcdd2",
    borderRadius: "20px",
    background: "#fff5f5",
    color: "#c62828",
    fontSize: "11px",
    fontWeight: "700",
  },

  detailsSection: {
    display: "flex",
    minWidth: 0,
    flexDirection: "column",
    gap: "20px",
    animation:
      "fadeInUp 0.5s ease",
  },

  productName: {
    margin: 0,
    color: "#2d2d2d",
    fontSize:
      "clamp(26px, 5vw, 34px)",
    fontWeight: "800",
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },

  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  price: {
    color: "#e91e8c",
    fontSize:
      "clamp(30px, 5vw, 40px)",
    fontWeight: "800",
  },

  secureCheckoutTag: {
    padding: "5px 14px",
    border: "1px solid #c8e6c9",
    borderRadius: "20px",
    background: "#e8f5e9",
    color: "#2e7d32",
    fontSize: "11px",
    fontWeight: "600",
  },

  priceSub: {
    margin: 0,
    color: "#777777",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  divider: {
    height: "1.5px",
    borderRadius: "2px",
    background:
      "linear-gradient(to right, #fce4ec, #fff5f8, #fce4ec)",
  },

  descBox: {
    padding: "22px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  descTitle: {
    margin: "0 0 10px",
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "700",
  },

  desc: {
    margin: 0,
    color: "#666666",
    fontSize: "13px",
    lineHeight: 1.75,
  },

  highlights: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  highlight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 18px",
    border: "1.5px solid #fce4ec",
    borderRadius: "14px",
    background: "#fff5f8",
  },

  highlightIcon: {
    flexShrink: 0,
    fontSize: "20px",
  },

  highlightTitle: {
    color: "#333333",
    fontSize: "13px",
    fontWeight: "700",
  },

  highlightSub: {
    marginTop: "2px",
    color: "#777777",
    fontSize: "10px",
  },

  actions: {
    display: "flex",
    gap: "12px",
  },

  addToCartBtn: {
    flex: 1,
    padding: "16px 24px",
    border: "none",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 6px 22px rgba(233,30,140,0.32)",
    color: "#ffffff",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "700",
  },

  goToCartBtn: {
    flex: 1,
    padding: "16px 24px",
    border: "none",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #43a047, #2e7d32)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "700",
  },

  wishlistBtn: {
    flexShrink: 0,
    padding: "16px 20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "16px",
    background: "#fff5f8",
    color: "#e91e8c",
    cursor: "pointer",
    fontSize: "20px",
  },

  wishlistBtnActive: {
    flexShrink: 0,
    padding: "16px 20px",
    border: "1.5px solid #e91e8c",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
    color: "#e91e8c",
    cursor: "pointer",
    fontSize: "20px",
  },

  buyNowBtn: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "16px",
    background: "#2d2d2d",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "700",
  },

  trustRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  trustBadge: {
    padding: "5px 14px",
    border: "1px solid #f8bbd0",
    borderRadius: "20px",
    background: "#fff5f8",
    color: "#a81750",
    fontSize: "10px",
    fontWeight: "600",
  },

  backLink: {
    display: "inline-block",
    color: "#b85d82",
    fontSize: "12px",
    fontWeight: "600",
    textDecoration: "none",
  },

  reviewsContainer: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "30px auto",
  },

  reviewsCard: {
    padding: "30px",
    border: "2px solid #fce4ec",
    borderRadius: "24px",
    background: "#ffffff",
  },

  reviewsTitle: {
    margin: "0 0 20px",
    color: "#e91e8c",
  },

  reviewForm: {
    display: "flex",
    marginBottom: "30px",
    padding: "20px",
    flexDirection: "column",
    gap: "10px",
    borderRadius: "18px",
    background: "#fff5f8",
  },

  reviewFormTitle: {
    margin: "0 0 5px",
    color: "#a81750",
  },

  reviewLabel: {
    color: "#a81750",
    fontSize: "12px",
    fontWeight: "700",
  },

  reviewInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #f8bbd0",
    borderRadius: "12px",
    background: "#ffffff",
    fontFamily: "inherit",
  },

  reviewTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #f8bbd0",
    borderRadius: "12px",
    resize: "vertical",
    background: "#ffffff",
    fontFamily: "inherit",
  },

  reviewCharacterCount: {
    alignSelf: "flex-end",
    color: "#777777",
    fontSize: "10px",
  },

  reviewSubmitButton: {
    alignSelf: "flex-start",
    padding: "12px 24px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  reviewLoginBox: {
    marginBottom: "30px",
    padding: "20px",
    border: "1px solid #f8bbd0",
    borderRadius: "16px",
    background: "#fff5f8",
    textAlign: "center",
  },

  reviewLoginText: {
    margin: "0 0 12px",
    color: "#777777",
    fontSize: "13px",
  },

  reviewLoginLink: {
    display: "inline-flex",
    padding: "10px 18px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    textDecoration: "none",
  },

  reviewListTitle: {
    margin: "0 0 20px",
    color: "#a81750",
  },

  reviewStatusText: {
    color: "#777777",
    fontSize: "13px",
  },

  reviewItem: {
    marginBottom: "16px",
    padding: "16px",
    border: "1px solid #f8bbd0",
    borderRadius: "18px",
    background: "#fffafc",
  },

  reviewItemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },

  reviewerName: {
    margin: 0,
    color: "#e91e8c",
  },

  reviewDate: {
    color: "#777777",
    fontSize: "10px",
  },

  reviewStars: {
    margin: "8px 0",
  },

  reviewComment: {
    margin: 0,
    color: "#555555",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  footer: {
    marginTop: "70px",
    padding: "28px",
    background: "#2d2d2d",
    color: "#999999",
    fontSize: "12px",
    textAlign: "center",
  },
};