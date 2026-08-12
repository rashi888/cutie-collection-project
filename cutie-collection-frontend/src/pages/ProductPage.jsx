import { useCallback, useEffect, useMemo, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import CartService from "../api/CartService";
import CategoryService from "../api/CategoryService";
import ProductService from "../api/ProductService";
import WishlistService from "../api/WishlistService";

import ProductCard from "../components/ProductCard";

import { showError, showSuccess } from "../utils/toastUtils";

const PAGE_SIZE = 8;

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);

  const [sortBy, setSortBy] = useState("id");

  const [direction, setDirection] = useState("asc");

  const [keyword, setKeyword] = useState("");

  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [totalPages, setTotalPages] = useState(0);

  const [cartProductIds, setCartProductIds] = useState([]);

  const [wishlistProductIds, setWishlistProductIds] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const isAuthenticated = Boolean(token);

  const selectedCategory = searchParams.get("categoryId") || "";

  /*
   * Delay the search request slightly
   * so the backend is not called after
   * every individual keystroke.
   */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());

      setPage(0);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [keyword]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await CategoryService.getAll();

      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setCategories([]);

      showError(error, "Unable to load categories");
    }
  }, []);

  const loadCustomerState = useCallback(async () => {
    if (!isAuthenticated) {
      setCartProductIds([]);
      setWishlistProductIds([]);
      return;
    }

    try {
      const [cartResponse, wishlistResponse] = await Promise.all([
        CartService.getCart(),
        WishlistService.getWishlist(),
      ]);

      const cartItems = Array.isArray(cartResponse.data)
        ? cartResponse.data
        : [];

      const wishlistItems = Array.isArray(wishlistResponse.data)
        ? wishlistResponse.data
        : [];

      setCartProductIds(cartItems.map((item) => Number(item.productId)));

      setWishlistProductIds(
        wishlistItems.map((item) => Number(item.productId)),
      );
    } catch (error) {
      console.error("Unable to load cart and wishlist state:", error);
    }
  }, [isAuthenticated]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      if (debouncedKeyword) {
        const response = await ProductService.searchByKeyword(debouncedKeyword);

        setProducts(Array.isArray(response.data) ? response.data : []);

        setTotalPages(1);
        return;
      }

      if (selectedCategory) {
        const categoryId = Number(selectedCategory);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
          setProducts([]);
          setTotalPages(0);
          return;
        }

        const response = await ProductService.getByCategory(categoryId);

        setProducts(Array.isArray(response.data) ? response.data : []);

        setTotalPages(1);
        return;
      }

      const response = await ProductService.getPagedProducts(
        page,
        PAGE_SIZE,
        sortBy,
        direction,
      );

      const responseData = response.data || {};

      setProducts(
        Array.isArray(responseData.content) ? responseData.content : [],
      );

      setTotalPages(Number(responseData.totalPages || 0));
    } catch (error) {
      setProducts([]);
      setTotalPages(0);

      showError(error, "Unable to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, selectedCategory, page, sortBy, direction]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCustomerState();
  }, [loadCustomerState]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCategoryFilter = (categoryId) => {
    setPage(0);
    setKeyword("");
    setDebouncedKeyword("");

    if (categoryId) {
      setSearchParams({
        categoryId: String(categoryId),
      });
    } else {
      setSearchParams({});
    }
  };

  const requireAuthentication = (productId) => {
    if (isAuthenticated) {
      return true;
    }

    navigate("/login", {
      state: {
        from: `/products/${productId}`,
      },
    });

    return false;
  };

  const handleAddToCart = async (product) => {
  if (!requireAuthentication(product.id)) {
    return false;
  }

  const productId = Number(product.id);

  try {
    await CartService.addItem({
      productId,
      quantity: 1,
    });

    setCartProductIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds
        : [...currentIds, productId]
    );

    showSuccess(
      `${product.name} added to cart`
    );

    return true;
  } catch (error) {
    showError(
      error,
      "Unable to add the product to cart"
    );

    throw error;
  }
};

  const handleWishlist = async (product) => {
    if (!requireAuthentication(product.id)) {
      return;
    }

    const productId = Number(product.id);

    const alreadyWishlisted = wishlistProductIds.includes(productId);

    try {
      if (alreadyWishlisted) {
        await WishlistService.removeFromWishlist(productId);

        setWishlistProductIds((currentIds) =>
          currentIds.filter(
            (currentProductId) => currentProductId !== productId,
          ),
        );

        showSuccess("Product removed from wishlist");
      } else {
        await WishlistService.addToWishlist(productId);

        setWishlistProductIds((currentIds) =>
          currentIds.includes(productId)
            ? currentIds
            : [...currentIds, productId],
        );

        showSuccess(`${product.name} added to wishlist`);
      }
    } catch (error) {
      showError(error, "Unable to update the wishlist");

      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("role");
    localStorage.removeItem("username");

    setCartProductIds([]);
    setWishlistProductIds([]);

    navigate("/login", {
      replace: true,
    });
  };

  const handleSortChange = (event) => {
    const [field, sortDirection] = event.target.value.split("-");

    setSortBy(field);
    setDirection(sortDirection);
    setPage(0);
  };

  const clearSearch = () => {
    setKeyword("");
    setDebouncedKeyword("");
    setPage(0);
  };

  const pageButtons = useMemo(
    () =>
      Array.from(
        {
          length: totalPages,
        },
        (_, index) => index,
      ),
    [totalPages],
  );

  return (
    <div style={S.page}>
      <style>{keyframes}</style>

      {/* Navigation */}
      <nav style={S.navbar}>
        <Link to="/" style={S.brandLink}>
          <div style={S.navBrand}>
            <span style={S.navLogo} aria-hidden="true">
              🌸
            </span>

            <span style={S.navTitle}>Cutie Collection</span>
          </div>
        </Link>

        <div style={S.navLinks}>
          <Link to="/" style={S.navLink}>
            Home
          </Link>

          <Link to="/categories" style={S.navLink}>
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
              <Link to="/wishlist" style={S.navLink}>
                💖 Wishlist
              </Link>

              <Link to="/cart" style={S.navLink}>
                🛒 Cart
              </Link>

              <Link to="/orders" style={S.navLink}>
                📦 Orders
              </Link>
            </>
          )}
        </div>

        <div style={S.navRight}>
          {/* Search */}
          <div style={S.searchBox}>
            <span style={S.searchIcon} aria-hidden="true">
              🔍
            </span>

            <input
              type="search"
              placeholder="Search products..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              style={S.searchInput}
              aria-label="Search products"
            />

            {keyword && (
              <button
                type="button"
                onClick={clearSearch}
                style={S.clearBtn}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sorting */}
          {!debouncedKeyword && !selectedCategory && (
            <div style={S.sortWrapper}>
              <span style={S.sortIcon} aria-hidden="true">
                ↕️
              </span>

              <select
                value={`${sortBy}-${direction}`}
                onChange={handleSortChange}
                style={S.sortSelect}
                aria-label="Sort products"
              >
                <option value="id-asc">Default</option>

                <option value="price-asc">Price: Low to High</option>

                <option value="price-desc">Price: High to Low</option>

                <option value="name-asc">Name: A to Z</option>

                <option value="name-desc">Name: Z to A</option>

                <option value="stockQuantity-desc">Stock: High to Low</option>
              </select>
            </div>
          )}

          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} style={S.logoutBtn}>
              🌸 Logout
            </button>
          ) : (
            <Link to="/login" style={S.loginLink}>
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Header */}
      <header style={S.header}>
        <div style={S.blob1} aria-hidden="true" />

        <div style={S.blob2} aria-hidden="true" />

        <div style={S.headerContent}>
          <span style={S.badge}>✨ Our Collections</span>

          <h1 style={S.title}>
            Cutie <span style={S.accent}>Products 🛍️</span>
          </h1>

          <p style={S.sub}>
            Browse active products from our latest collections.
          </p>

          {debouncedKeyword && (
            <p style={S.resultCount}>
              Showing results for{" "}
              <strong>
                &ldquo;
                {debouncedKeyword}
                &rdquo;
              </strong>
            </p>
          )}

          {!debouncedKeyword && selectedCategory && (
            <p style={S.resultCount}>
              Showing products from{" "}
              <strong>
                {categories.find(
                  (category) =>
                    String(category.id) === String(selectedCategory),
                )?.name || "the selected category"}
              </strong>
            </p>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={S.container}>
        {/* Category filters */}
        {!debouncedKeyword && (
          <div style={S.filterRow}>
            <button
              type="button"
              style={selectedCategory === "" ? S.filterBtnActive : S.filterBtn}
              onClick={() => handleCategoryFilter("")}
            >
              All 🌸
            </button>

            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                style={
                  String(selectedCategory) === String(category.id)
                    ? S.filterBtnActive
                    : S.filterBtn
                }
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div style={S.skeletonGrid}>
            {Array.from(
              {
                length: PAGE_SIZE,
              },
              (_, index) => (
                <div key={index} style={S.skeletonCard}>
                  <div style={S.skeletonImg} />

                  <div style={S.skeletonLine} />

                  <div
                    style={{
                      ...S.skeletonLine,
                      width: "60%",
                      height: "14px",
                    }}
                  />

                  <div
                    style={{
                      ...S.skeletonLine,
                      width: "40%",
                      height: "22px",
                      marginTop: "8px",
                    }}
                  />
                </div>
              ),
            )}
          </div>
        ) : products.length === 0 ? (
          <div style={S.emptyBox}>
            <span style={S.emptyIcon} aria-hidden="true">
              🛒
            </span>

            <p style={S.emptyText}>No products found</p>

            <p style={S.emptySub}>Try another search or category.</p>

            {(debouncedKeyword || selectedCategory) && (
              <button
                type="button"
                style={S.clearSearchBtn}
                onClick={() => {
                  clearSearch();
                  handleCategoryFilter("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={S.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleWishlist}
                isInCart={cartProductIds.includes(Number(product.id))}
                isInWishlist={wishlistProductIds.includes(Number(product.id))}
              />
            ))}
          </div>
        )}
      </main>

      {/* Pagination */}
      {!loading && !debouncedKeyword && !selectedCategory && totalPages > 1 && (
        <div style={S.pagination}>
          <button
            type="button"
            style={page === 0 ? S.pageNavBtnDisabled : S.pageNavBtn}
            disabled={page === 0}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            ← Previous
          </button>

          <div style={S.pageNumbers}>
            {pageButtons.map((pageNumber) => (
              <button
                type="button"
                key={pageNumber}
                style={pageNumber === page ? S.pageNumActive : S.pageNum}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            style={page >= totalPages - 1 ? S.pageNavBtnDisabled : S.pageNavBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Footer */}
      <footer style={S.footer}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} Cutie Collection. Made with 💕 for all
          cuties.
        </p>
      </footer>
    </div>
  );
}

/* ── Keyframes ── */
const keyframes = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const S = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#333",
  },

  /* NAVBAR */
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 60px",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    borderBottom: "1.5px solid #fce4ec",
    position: "sticky",
    top: 0,
    zIndex: 100,
    flexWrap: "wrap",
    gap: "12px",
    boxShadow: "0 2px 16px rgba(244,143,177,0.1)",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#c2185b",
    fontSize: "14px",
    fontWeight: "500",
    paddingBottom: "3px",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s",
  },
  navLinkActive: {
    color: "#e91e8c",
    fontWeight: "700",
    borderBottom: "2px solid #e91e8c",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  /* Search */
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "8px 14px",
  },
  searchIcon: { fontSize: "14px", flexShrink: 0 },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    fontFamily: "'Poppins', sans-serif",
    width: "160px",
    color: "#444",
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#f48fb1",
    fontSize: "13px",
    fontWeight: "700",
    padding: "0 2px",
    lineHeight: 1,
  },

  /* Sort */
  sortWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff5f8",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "8px 14px",
  },
  sortIcon: { fontSize: "14px", flexShrink: 0 },
  sortSelect: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    fontFamily: "'Poppins', sans-serif",
    color: "#c2185b",
    fontWeight: "500",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
  },

  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  /* HEADER */
  header: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    padding: "60px 60px 50px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "280px",
    height: "280px",
    background: "radial-gradient(circle, #f8bbd0, #f48fb1)",
    borderRadius: "50%",
    opacity: 0.25,
    filter: "blur(50px)",
  },
  blob2: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: "240px",
    height: "240px",
    background: "radial-gradient(circle, #fce4ec, #f8bbd0)",
    borderRadius: "50%",
    opacity: 0.3,
    filter: "blur(40px)",
  },
  headerContent: { position: "relative", zIndex: 1 },
  badge: {
    background: "#fff",
    color: "#e91e8c",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block",
    marginBottom: "16px",
  },
  title: {
    fontSize: "40px",
    fontWeight: "800",
    color: "#2d2d2d",
    marginBottom: "10px",
  },
  accent: { color: "#e91e8c" },
  sub: { fontSize: "15px", color: "#888", margin: 0 },
  resultCount: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#c2185b",
    background: "rgba(255,255,255,0.7)",
    display: "inline-block",
    padding: "4px 14px",
    borderRadius: "20px",
    border: "1px solid #f8bbd0",
  },

  /* CONTAINER */
  container: { padding: "40px 60px", maxWidth: "1200px", margin: "0 auto" },

  /* FILTER BUTTONS */
  filterRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "36px",
    alignItems: "center",
  },
  filterBtn: {
    background: "#fff",
    color: "#c2185b",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.2s",
  },
  filterBtnActive: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
  },

  /* SKELETON */
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "24px",
  },
  skeletonCard: {
    borderRadius: "24px",
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  skeletonImg: {
    height: "180px",
    borderRadius: "18px",
    background: "linear-gradient(90deg, #fce4ec 25%, #fff0f5 50%, #fce4ec 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.5s infinite linear",
  },
  skeletonLine: {
    height: "16px",
    borderRadius: "8px",
    width: "80%",
    background: "linear-gradient(90deg, #fce4ec 25%, #fff0f5 50%, #fce4ec 75%)",
    backgroundSize: "600px 100%",
    animation: "shimmer 1.5s infinite linear",
  },

  /* GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
    animation: "fadeInUp 0.4s ease",
  },

  /* EMPTY */
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px",
    border: "1.5px solid #f8bbd0",
  },
  emptyText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#e91e8c",
    marginTop: "16px",
  },
  emptySub: { fontSize: "14px", color: "#f48fb1", marginBottom: "20px" },
  clearSearchBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "10px 24px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
  },

  /* PAGINATION */
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "32px 60px 0",
    flexWrap: "wrap",
  },
  pageNavBtn: {
    background: "#fff5f8",
    color: "#e91e8c",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    padding: "10px 22px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    transition: "all 0.2s",
  },
  pageNavBtnDisabled: {
    background: "#f5f5f5",
    color: "#ccc",
    border: "1.5px solid #eee",
    borderRadius: "20px",
    padding: "10px 22px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "not-allowed",
    fontFamily: "'Poppins', sans-serif",
  },
  pageNumbers: { display: "flex", gap: "8px", flexWrap: "wrap" },
  pageNum: {
    background: "#fff",
    color: "#c2185b",
    border: "1.5px solid #f8bbd0",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  pageNumActive: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(233,30,140,0.32)",
  },

  /* FOOTER */
  footer: {
    background: "#2d2d2d",
    textAlign: "center",
    padding: "28px",
    fontSize: "13px",
    color: "#666",
    marginTop: "60px",
  },

  brandLink: {
    color: "inherit",
    textDecoration: "none",
  },

  loginLink: {
    padding: "8px 20px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow: "0 4px 14px rgba(233,30,140,0.28)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },

  emptyIcon: {
    display: "block",
    fontSize: "64px",
  },
};
