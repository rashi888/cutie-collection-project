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

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const productId = Number(id);

  const [product, setProduct] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [added, setAdded] =
    useState(false);

  const [wishlisted, setWishlisted] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

  const [submittingReview, setSubmittingReview] =
    useState(false);

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
          await ReviewService.getReviewsByProduct(
            productId
          );

        const loadedReviews =
          Array.isArray(response.data)
            ? response.data
            : [];

        setReviews(
          [...loadedReviews].sort(
            (firstReview, secondReview) =>
              new Date(
                secondReview.createdAt || 0
              ) -
              new Date(
                firstReview.createdAt || 0
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

  const loadCustomerState = useCallback(
    async () => {
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
          "Unable to load customer product state:",
          error
        );
      }
    },
    [isAuthenticated, productId]
  );

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
          productId: product.id,
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

      try {
        setWishlistLoading(true);

        if (wishlisted) {
          await WishlistService
            .removeFromWishlist(
              product.id
            );

          setWishlisted(false);

          showSuccess(
            "Product removed from wishlist"
          );
        } else {
          await WishlistService
            .addToWishlist(
              product.id
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

      /*
       * The product ID comes from the URL.
       * The backend gets the reviewer from JWT.
       */
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
          style={{
            textDecoration: "none",
          }}
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
              {product.imageUrl &&
              !imageError ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    ...S.productImage,
                    transform: imgHovered
                      ? "scale(1.05)"
                      : "scale(1)",
                  }}
                  loading="lazy"
                  onError={() =>
                    setImageError(true)
                  }
                />
              ) : (
                <div
                  style={{
                    ...S.imageFallback,
                    display: "flex",
                  }}
                >
                  <span
                    style={{
                      fontSize: "100px",
                    }}
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
                style={S.freeDeliveryTag}
              >
                🔒 Secure Checkout
              </div>
            </div>

            <p style={S.priceSub}>
              Final price and stock are
              revalidated by the backend
              during order placement.
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
            reviews.map((savedReview) => (
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
                    Number(
                      savedReview.rating ||
                        0
                    )
                  )}
                </p>

                <p style={S.reviewComment}>
                  {savedReview.comment}
                </p>
              </article>
            ))
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