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
import CategoryCard from "../components/CategoryCard";

import {
  showError,
  showSuccess,
  showWarning,
} from "../utils/toastUtils";

const EMPTY_FORM = {
  name: "",
  description: "",
};

export default function ManageCategories() {
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
    deleteConfirmId,
    setDeleteConfirmId,
  ] = useState(null);

  const navigate = useNavigate();

  const fetchCategories =
    useCallback(async () => {
      try {
        setFetching(true);

        const response =
          await CategoryService.getAllForAdmin();

        setCategories(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        setCategories([]);

        showError(
          error,
          "Unable to load categories"
        );
      } finally {
        setFetching(false);
      }
    }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const activeCount = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.active !== false
      ).length,
    [categories]
  );

  const inactiveCount =
    categories.length - activeCount;

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
    const normalizedName =
      form.name.trim();

    if (!normalizedName) {
      showWarning(
        "Category name is required"
      );
      return false;
    }

    if (normalizedName.length < 2) {
      showWarning(
        "Category name must contain at least 2 characters"
      );
      return false;
    }

    if (normalizedName.length > 100) {
      showWarning(
        "Category name cannot exceed 100 characters"
      );
      return false;
    }

    if (
      form.description.trim().length >
      500
    ) {
      showWarning(
        "Description cannot exceed 500 characters"
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
        form.description.trim() || null,
    };

    try {
      setSaving(true);

      if (editId) {
        await CategoryService.update(
          editId,
          requestData
        );

        showSuccess(
          "Category updated successfully"
        );
      } else {
        await CategoryService.create(
          requestData
        );

        showSuccess(
          "Category created successfully"
        );
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      showError(
        error,
        editId
          ? "Unable to update the category"
          : "Unable to create the category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name || "",
      description:
        category.description || "",
    });

    setEditId(category.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleActivate = async (
    categoryId
  ) => {
    try {
      await CategoryService.activate(
        categoryId
      );

      showSuccess(
        "Category activated successfully"
      );

      await fetchCategories();
    } catch (error) {
      showError(
        error,
        "Unable to activate the category"
      );
    }
  };

  const handleDeactivate = async (
    categoryId
  ) => {
    const category = categories.find(
      (item) =>
        item.id === categoryId
    );

    const confirmed = window.confirm(
      `Deactivate "${
        category?.name ||
        "this category"
      }"? It will be hidden from public category browsing.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await CategoryService.deactivate(
        categoryId
      );

      if (editId === categoryId) {
        resetForm();
      }

      showSuccess(
        "Category deactivated successfully"
      );

      await fetchCategories();
    } catch (error) {
      showError(
        error,
        "Unable to deactivate the category"
      );
    }
  };

  const handleDelete = async (
    categoryId
  ) => {
    try {
      /*
       * Backend deletion is a soft delete.
       * The category remains in the database
       * but becomes inactive.
       */
      await CategoryService.remove(
        categoryId
      );

      setDeleteConfirmId(null);

      if (editId === categoryId) {
        resetForm();
      }

      showSuccess(
        "Category deactivated successfully"
      );

      await fetchCategories();
    } catch (error) {
      showError(
        error,
        "Unable to deactivate the category"
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
            to="/categories"
            style={styles.navLink}
          >
            Categories
          </Link>

          <Link
            to="/admin/categories"
            style={{
              ...styles.navLink,
              color: "#e91e8c",
              fontWeight: "700",
            }}
          >
            Manage Categories
          </Link>

          <Link
            to="/admin/products"
            style={styles.navLink}
          >
            Manage Products
          </Link>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={styles.logoutBtn}
        >
          🌸 Logout
        </button>
      </nav>

      {/* Header */}
      <header style={styles.pageHeader}>
        <div
          style={styles.blob1}
          aria-hidden="true"
        />

        <div
          style={styles.blob2}
          aria-hidden="true"
        />

        <div style={styles.headerContent}>
          <span style={styles.badge}>
            ✨ Admin Panel
          </span>

          <h1 style={styles.pageTitle}>
            Manage{" "}
            <span style={styles.accent}>
              Categories 📦
            </span>
          </h1>

          <p style={styles.pageSub}>
            Create, edit, activate, and
            deactivate store categories.
          </p>

          <button
            type="button"
            style={styles.addBtn}
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
              : "+ Add New Category 🌸"}
          </button>
        </div>
      </header>

      <main style={styles.container}>
        {/* Category form */}
        {showForm && (
          <section style={styles.formCard}>
            <h2 style={styles.formTitle}>
              {editId
                ? "✏️ Edit Category"
                : "🌸 New Category"}
            </h2>

            <form
              onSubmit={handleSubmit}
              style={styles.form}
              noValidate
            >
              <div
                style={styles.inputGroup}
              >
                <label
                  htmlFor="category-name"
                  style={styles.label}
                >
                  Category Name
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >
                  <span
                    style={
                      styles.inputIcon
                    }
                    aria-hidden="true"
                  >
                    🏷️
                  </span>

                  <input
                    id="category-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Soft Toys"
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={saving}
                    style={styles.input}
                  />
                </div>

                <span
                  style={
                    styles.characterCount
                  }
                >
                  {form.name.length}/100
                </span>
              </div>

              <div
                style={styles.inputGroup}
              >
                <label
                  htmlFor="category-description"
                  style={styles.label}
                >
                  Description{" "}
                  <span
                    style={styles.optional}
                  >
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
                      ...styles.inputIcon,
                      marginTop: "14px",
                    }}
                    aria-hidden="true"
                  >
                    📝
                  </span>

                  <textarea
                    id="category-description"
                    name="description"
                    value={
                      form.description
                    }
                    onChange={handleChange}
                    placeholder="Describe the category..."
                    rows={4}
                    maxLength={500}
                    disabled={saving}
                    style={styles.textarea}
                  />
                </div>

                <span
                  style={
                    styles.characterCount
                  }
                >
                  {form.description.length}
                  /500
                </span>
              </div>

              <div
                style={styles.formActions}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.submitBtn,
                    opacity: saving
                      ? 0.65
                      : 1,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editId
                      ? "Update Category 💕"
                      : "Create Category 🌸"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  style={{
                    ...styles.cancelBtn,
                    opacity: saving
                      ? 0.6
                      : 1,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Statistics */}
        <section style={styles.statsRow}>
          <div style={styles.statCard}>
            <span
              style={styles.statEmoji}
              aria-hidden="true"
            >
              📦
            </span>

            <div>
              <div style={styles.statNum}>
                {categories.length}
              </div>

              <div
                style={styles.statLabel}
              >
                Total Categories
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <span
              style={styles.statEmoji}
              aria-hidden="true"
            >
              ✅
            </span>

            <div>
              <div style={styles.statNum}>
                {activeCount}
              </div>

              <div
                style={styles.statLabel}
              >
                Active
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <span
              style={styles.statEmoji}
              aria-hidden="true"
            >
              ⏸️
            </span>

            <div>
              <div style={styles.statNum}>
                {inactiveCount}
              </div>

              <div
                style={styles.statLabel}
              >
                Inactive
              </div>
            </div>
          </div>
        </section>

        {/* Category list */}
        <div style={styles.listHeader}>
          <h2 style={styles.listTitle}>
            All Categories 💝
          </h2>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={fetchCategories}
            disabled={fetching}
          >
            {fetching
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        {fetching ? (
          <div style={styles.loadingState}>
            <span
              style={styles.loadingEmoji}
              aria-hidden="true"
            >
              🌸
            </span>

            <p>Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={styles.emptyState}>
            <span
              style={styles.emptyEmoji}
              aria-hidden="true"
            >
              🛍️
            </span>

            <p style={styles.emptyText}>
              No categories yet!
            </p>

            <p style={styles.emptySub}>
              Add your first category to
              get started.
            </p>

            <button
              type="button"
              style={styles.addBtn}
              onClick={() =>
                setShowForm(true)
              }
            >
              + Add Category
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {categories.map(
              (category) => (
                <div key={category.id}>
                  <CategoryCard
                    category={category}
                    onEdit={handleEdit}
                    onActivate={
                      handleActivate
                    }
                    onDeactivate={
                      handleDeactivate
                    }
                    onDelete={(
                      categoryId
                    ) =>
                      setDeleteConfirmId(
                        categoryId
                      )
                    }
                  />

                  {deleteConfirmId ===
                    category.id && (
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
                        {category.name}
                        &quot;? It will be
                        hidden from public
                        category browsing.
                      </p>

                      <div
                        style={
                          styles.confirmActions
                        }
                      >
                        <button
                          type="button"
                          style={
                            styles.confirmYes
                          }
                          onClick={() =>
                            handleDelete(
                              category.id
                            )
                          }
                        >
                          Yes, Deactivate
                        </button>

                        <button
                          type="button"
                          style={
                            styles.confirmNo
                          }
                          onClick={() =>
                            setDeleteConfirmId(
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
        <p>
          © {new Date().getFullYear()} Cutie
          Collection. Made with 💕 for all
          cuties.
        </p>
      </footer>
    </div>
  );
}