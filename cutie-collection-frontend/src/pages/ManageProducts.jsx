import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import CategoryService from "../api/CategoryService";
import ProductService from "../api/ProductService";

import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";

import {
  showError,
  showSuccess,
  showWarning,
} from "../utils/toastUtils";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  categoryId: "",
};

export default function ManageProducts() {
  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [editId, setEditId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [
    deactivateConfirmId,
    setDeactivateConfirmId,
  ] = useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      setFetching(true);

      const [
        productResponse,
        categoryResponse,
      ] = await Promise.all([
        ProductService.getAllForAdmin(),
        CategoryService.getAllForAdmin(),
      ]);

      setProducts(
        Array.isArray(productResponse.data)
          ? productResponse.data
          : []
      );

      setCategories(
        Array.isArray(categoryResponse.data)
          ? categoryResponse.data
          : []
      );
    } catch (error) {
      setProducts([]);
      setCategories([]);

      showError(
        error,
        "Unable to load product management data"
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeProductsCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active !== false
      ).length,
    [products]
  );

  const inactiveProductsCount =
    products.length - activeProductsCount;

  const outOfStockCount = useMemo(
    () =>
      products.filter(
        (product) =>
          product.active !== false &&
          Number(
            product.stockQuantity || 0
          ) <= 0
      ).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const searchValue =
      searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const isActive =
        product.active !== false;

      const isOutOfStock =
        Number(
          product.stockQuantity || 0
        ) <= 0;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          isActive) ||
        (statusFilter === "INACTIVE" &&
          !isActive) ||
        (statusFilter ===
          "OUT_OF_STOCK" &&
          isActive &&
          isOutOfStock);

      const matchesSearch =
        !searchValue ||
        product.name
          ?.toLowerCase()
          .includes(searchValue) ||
        product.description
          ?.toLowerCase()
          .includes(searchValue) ||
        product.categoryName
          ?.toLowerCase()
          .includes(searchValue);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    products,
    searchTerm,
    statusFilter,
  ]);

const handleChange = (event) => {
const { name, value } = event.target;
setForm((currentForm) => ({
...currentForm,
[name]: value,
}));
};

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const validateForm = () => {
    const productName =
      form.name.trim();

    const price =
      Number(form.price);

    const stockQuantity =
      Number(form.stockQuantity);

    const categoryId =
      Number(form.categoryId);

    if (productName.length < 2) {
      showWarning(
        "Product name must contain at least 2 characters"
      );

      return false;
    }

    if (productName.length > 255) {
      showWarning(
        "Product name cannot exceed 255 characters"
      );

      return false;
    }

    if (
      form.description.trim().length >
      5000
    ) {
      showWarning(
        "Description cannot exceed 5000 characters"
      );

      return false;
    }

    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0.01
    ) {
      showWarning(
        "Price must be at least ₹0.01"
      );

      return false;
    }

    /*
     * Zero is a valid stock value.
     * Therefore, do not use !form.stockQuantity.
     */
    if (
      form.stockQuantity === "" ||
      !Number.isInteger(
        stockQuantity
      ) ||
      stockQuantity < 0
    ) {
      showWarning(
        "Stock must be a nonnegative whole number"
      );

      return false;
    }

    if (
      form.categoryId === "" ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      showWarning(
        "Please select an active category"
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const requestData = {
      name: form.name.trim(),

      description:
        form.description.trim() ||
        null,

      price: Number(form.price),

      stockQuantity: Number(
        form.stockQuantity
      ),

      imageUrl:
        form.imageUrl.trim() || null,

      categoryId: Number(
        form.categoryId
      ),
    };

    try {
      setSaving(true);

      if (editId) {
        await ProductService.update(
          editId,
          requestData
        );

        showSuccess(
          "Product updated successfully"
        );
      } else {
        await ProductService.create(
          requestData
        );

        showSuccess(
          "Product created successfully"
        );
      }

      resetForm();
      await fetchAll();
    } catch (error) {
      showError(
        error,
        editId
          ? "Unable to update the product"
          : "Unable to create the product"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",

      description:
        product.description || "",

      price:
        product.price !== null &&
        product.price !== undefined
          ? String(product.price)
          : "",

      stockQuantity:
        product.stockQuantity !== null &&
        product.stockQuantity !==
          undefined
          ? String(
              product.stockQuantity
            )
          : "",

      imageUrl:
        product.imageUrl || "",

      categoryId:
        product.categoryId !== null &&
        product.categoryId !==
          undefined
          ? String(
              product.categoryId
            )
          : "",
    });

    setEditId(product.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleActivate = async (
    productId
  ) => {
    try {
      await ProductService.activate(
        productId
      );

      showSuccess(
        "Product activated successfully"
      );

      await fetchAll();
    } catch (error) {
      showError(
        error,
        "Unable to activate the product"
      );
    }
  };

  const handleDeactivate = async (
    productId
  ) => {
    try {
      /*
       * Product deletion is a soft delete.
       * The product becomes inactive.
       */
      await ProductService.remove(
        productId
      );

      setDeactivateConfirmId(null);

      if (editId === productId) {
        resetForm();
      }

      showSuccess(
        "Product deactivated successfully"
      );

      await fetchAll();
    } catch (error) {
      showError(
        error,
        "Unable to deactivate the product"
      );
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

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <Link
          to="/"
          style={styles.brandLink}
        >
          <div style={styles.navBrand}>
            <span
              style={styles.navLogo}
              aria-hidden="true"
            >
              🌸
            </span>

            <span style={styles.navTitle}>
              Cutie Collection
            </span>
          </div>
        </Link>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
          >
            Home
          </Link>

          <Link
            to="/products"
            style={styles.navLink}
          >
            Products
          </Link>

          <Link
            to="/admin/categories"
            style={styles.navLink}
          >
            Manage Categories
          </Link>

          <Link
            to="/admin/products"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            Manage Products
          </Link>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          🌸 Logout
        </button>
      </nav>

      {/* Header */}
      <header style={styles.pageHeader}>
        <div
          style={styles.blobOne}
          aria-hidden="true"
        />

        <div
          style={styles.blobTwo}
          aria-hidden="true"
        />

        <div style={styles.headerContent}>
          <span style={styles.headerBadge}>
            ✨ Admin Panel
          </span>

          <h1 style={styles.pageTitle}>
            Manage{" "}
            <span style={styles.accent}>
              Products 🛍️
            </span>
          </h1>

          <p style={styles.pageSubtitle}>
            Create, update, activate, and
            deactivate store products.
          </p>

          <button
            type="button"
            style={styles.addButton}
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setForm(EMPTY_FORM);
                setEditId(null);
                setShowForm(true);
              }
            }}
          >
            {showForm
              ? "✖ Close Form"
              : "+ Add New Product 🌸"}
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {/* Product form */}
        {showForm && (
          <ProductForm
            form={form}
            categories={categories}
            loading={saving}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            editId={editId}
          />
        )}

        {/* Statistics */}
        <section style={styles.statsGrid}>
          <StatCard
            icon="🛍️"
            value={products.length}
            label="Total Products"
          />

          <StatCard
            icon="✅"
            value={activeProductsCount}
            label="Active"
          />

          <StatCard
            icon="⏸️"
            value={
              inactiveProductsCount
            }
            label="Inactive"
          />

          <StatCard
            icon="📦"
            value={outOfStockCount}
            label="Out of Stock"
          />
        </section>

        {/* List heading */}
        <div style={styles.listHeader}>
          <div>
            <h2 style={styles.listTitle}>
              All Products 💝
            </h2>

            <p style={styles.listSubtitle}>
              Active and inactive products
              are visible to administrators.
            </p>
          </div>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={fetchAll}
            disabled={fetching}
          >
            {fetching
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.searchWrapper}>
            <span aria-hidden="true">
              🔍
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search products..."
              style={styles.searchInput}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={styles.statusSelect}
            aria-label="Filter products by status"
          >
            <option value="ALL">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

            <option value="OUT_OF_STOCK">
              Out of stock
            </option>
          </select>
        </div>

        {/* Product list */}
        {fetching ? (
          <div style={styles.statusBox}>
            <span style={styles.statusIcon}>
              🌸
            </span>

            <p style={styles.statusTitle}>
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div style={styles.statusBox}>
            <span style={styles.statusIcon}>
              🛍️
            </span>

            <p style={styles.statusTitle}>
              {products.length === 0
                ? "No products yet"
                : "No matching products"}
            </p>

            <p style={styles.statusText}>
              {products.length === 0
                ? "Add your first product to get started."
                : "Try changing the search or status filter."}
            </p>

            {products.length === 0 && (
              <button
                type="button"
                style={styles.addButton}
                onClick={() =>
                  setShowForm(true)
                }
              >
                + Add Product
              </button>
            )}
          </div>
        ) : (
          <div style={styles.productGrid}>
            {filteredProducts.map(
              (product) => (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                    onEdit={handleEdit}
                    onActivate={
                      handleActivate
                    }
                    onDelete={(
                      productId
                    ) =>
                      setDeactivateConfirmId(
                        productId
                      )
                    }
                  />

                  {deactivateConfirmId ===
                    product.id && (
                    <div
                      style={
                        styles.confirmBox
                      }
                    >
                      <p
                        style={
                          styles.confirmText
                        }
                      >
                        Deactivate &quot;
                        {product.name}&quot;?
                        This product will be
                        hidden from public
                        browsing.
                      </p>

                      <div
                        style={
                          styles.confirmActions
                        }
                      >
                        <button
                          type="button"
                          style={
                            styles.confirmButton
                          }
                          onClick={() =>
                            handleDeactivate(
                              product.id
                            )
                          }
                        >
                          Yes, Deactivate
                        </button>

                        <button
                          type="button"
                          style={
                            styles.cancelButton
                          }
                          onClick={() =>
                            setDeactivateConfirmId(
                              null
                            )
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Cutie
        Collection. Made with 💕 for all
        cuties.
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}) {
  return (
    <article style={styles.statCard}>
      <span
        style={styles.statIcon}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div>
        <strong style={styles.statValue}>
          {value}
        </strong>

        <span style={styles.statLabel}>
          {label}
        </span>
      </div>
    </article>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#333333",
    fontFamily: "'Poppins', sans-serif",
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
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
  },

  brandLink: {
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
    color: "#a81750",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },

  activeNavLink: {
    color: "#e91e8c",
    fontWeight: "700",
  },

  logoutButton: {
    padding: "8px 18px",
    border: "none",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "600",
  },

  pageHeader: {
    position: "relative",
    padding: "60px 5% 50px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  blobOne: {
    position: "absolute",
    top: "-80px",
    right: "-60px",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #f8bbd0, #f48fb1)",
    opacity: 0.25,
    filter: "blur(50px)",
  },

  blobTwo: {
    position: "absolute",
    bottom: "-60px",
    left: "-60px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #fce4ec, #f8bbd0)",
    opacity: 0.3,
    filter: "blur(40px)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
  },

  headerBadge: {
    display: "inline-block",
    marginBottom: "16px",
    padding: "6px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "20px",
    background: "#ffffff",
    color: "#e91e8c",
    fontSize: "13px",
    fontWeight: "600",
  },

  pageTitle: {
    margin: "0 0 10px",
    color: "#2d2d2d",
    fontSize: "clamp(32px, 6vw, 40px)",
    fontWeight: "800",
  },

  accent: {
    color: "#e91e8c",
  },

  pageSubtitle: {
    margin: "0 0 28px",
    color: "#777777",
    fontSize: "15px",
  },

  addButton: {
    padding: "13px 28px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f06292, #e91e8c)",
    boxShadow:
      "0 6px 20px rgba(233,30,140,0.3)",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    fontWeight: "600",
  },

  container: {
    width: "min(1200px, calc(100% - 32px))",
    margin: "0 auto",
    padding: "40px 0 70px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "18px",
    background:
      "linear-gradient(135deg, #fff0f5, #fce4ec)",
  },

  statIcon: {
    fontSize: "30px",
  },

  statValue: {
    display: "block",
    color: "#e91e8c",
    fontSize: "23px",
    fontWeight: "800",
  },

  statLabel: {
    display: "block",
    marginTop: "3px",
    color: "#9f5575",
    fontSize: "11px",
  },

  listHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "18px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  listTitle: {
    margin: "0 0 5px",
    color: "#e91e8c",
    fontSize: "22px",
    fontWeight: "700",
  },

  listSubtitle: {
    margin: 0,
    color: "#777777",
    fontSize: "12px",
  },

  refreshButton: {
    padding: "8px 15px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "11px",
    background: "#fff5f8",
    color: "#a81750",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: "600",
  },

  filters: {
    display: "flex",
    gap: "14px",
    marginBottom: "26px",
    flexWrap: "wrap",
  },

  searchWrapper: {
    display: "flex",
    minWidth: "240px",
    flex: 1,
    alignItems: "center",
    gap: "9px",
    padding: "0 13px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    background: "#fffafd",
  },

  searchInput: {
    width: "100%",
    padding: "11px 0",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#333333",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  statusSelect: {
    minWidth: "170px",
    padding: "11px 13px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "12px",
    outline: "none",
    background: "#fffafd",
    color: "#333333",
    fontFamily: "inherit",
    fontSize: "13px",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(270px, 1fr))",
    gap: "24px",
  },

  statusBox: {
    padding: "58px 20px",
    border: "1.5px dashed #f8bbd0",
    borderRadius: "22px",
    background: "#fffafd",
    textAlign: "center",
  },

  statusIcon: {
    display: "block",
    marginBottom: "12px",
    fontSize: "48px",
  },

  statusTitle: {
    margin: "0 0 6px",
    color: "#c2185b",
    fontSize: "18px",
    fontWeight: "700",
  },

  statusText: {
    margin: "0 0 20px",
    color: "#777777",
    fontSize: "12px",
  },

  confirmBox: {
    marginTop: "12px",
    padding: "16px",
    border: "1.5px solid #ffcdd2",
    borderRadius: "14px",
    background: "#fff5f5",
  },

  confirmText: {
    margin: "0 0 12px",
    color: "#c62828",
    fontSize: "12px",
    fontWeight: "600",
    lineHeight: 1.5,
  },

  confirmActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  confirmButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#c62828",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: "700",
  },

  cancelButton: {
    padding: "8px 16px",
    border: "1.5px solid #f8bbd0",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#a81750",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "11px",
    fontWeight: "600",
  },

  footer: {
    padding: "24px",
    background: "#2d2d2d",
    color: "#999999",
    fontSize: "12px",
    textAlign: "center",
  },
};