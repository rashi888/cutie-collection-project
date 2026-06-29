import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductService from "../api/ProductService";
import CategoryService from "../api/CategoryService";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  categoryId: "",
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch {
      toast.error("Failed to load data 💔");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) { toast.error("Product name is required 🌷"); return; }
    if (!form.price) { toast.error("Price is required 💰"); return; }
    if (!form.stockQuantity) { toast.error("Stock quantity is required 📦"); return; }
    if (!form.categoryId) { toast.error("Please select a category 🗂️"); return; }

    try {
      setLoading(true);

      const payload = {
        ...form,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: Number(form.categoryId),
      };

      if (editId) {
        await ProductService.update(editId, payload);
        toast.success("Product updated! 💕");
      } else {
        await ProductService.create(payload);
        toast.success("Product created! 🌸");
      }

      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save product 💔");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId,
    });
    setEditId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await ProductService.delete(id);
      toast.success("Product deleted! 🗑️");
      setDeleteConfirmId(null);
      fetchAll();
    } catch {
      toast.error("Failed to delete product 💔");
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div style={styles.page}>

      {/* ── NAVBAR ── */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>🌸</span>
          <span style={styles.navTitle}>Cutie Collection</span>
        </div>
        <div style={styles.navLinks}>
          <a href="/" style={styles.navLink}>Home</a>
          <a href="/categories" style={styles.navLink}>Categories</a>
          <a href="/products" style={styles.navLink}>Products</a>
          <a href="/manage-products" style={{ ...styles.navLink, color: "#e91e8c", fontWeight: "700" }}>
            Manage
          </a>
        </div>
        <button
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={styles.logoutBtn}
        >
          🌸 Logout
        </button>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div style={styles.pageHeader}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.headerContent}>
          <span style={styles.badge}>✨ Admin Panel</span>
          <h1 style={styles.pageTitle}>
            Manage <span style={styles.accent}>Products 🛍️</span>
          </h1>
          <p style={styles.pageSub}>Add, update and delete your store products</p>
          <button
            style={styles.addBtn}
            onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditId(null); }}
          >
            {showForm ? "✖ Close Form" : "+ Add New Product 🌸"}
          </button>
        </div>
      </div>

      <div style={styles.container}>

        {/* ── FORM ── */}
        {showForm && (
          <ProductForm
            form={form}
            categories={categories}
            loading={loading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            editId={editId}
          />
        )}

        {/* ── STATS ROW ── */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statEmoji}>🛍️</span>
            <div>
              <div style={styles.statNum}>{products.length}</div>
              <div style={styles.statLabel}>Total Products</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statEmoji}>✅</span>
            <div>
              <div style={styles.statNum}>
                {products.filter((p) => p.stockQuantity > 0).length}
              </div>
              <div style={styles.statLabel}>In Stock</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statEmoji}>📦</span>
            <div>
              <div style={styles.statNum}>
                {products.filter((p) => p.stockQuantity === 0).length}
              </div>
              <div style={styles.statLabel}>Out of Stock</div>
            </div>
          </div>
        </div>

        {/* ── PRODUCT LIST ── */}
        <h2 style={styles.listTitle}>All Products 💝</h2>

        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: "64px" }}>🛍️</span>
            <p style={styles.emptyText}>No products yet!</p>
            <p style={styles.emptySub}>Add your first product to get started 🌸</p>
            <button style={styles.addBtn} onClick={() => setShowForm(true)}>
              + Add Product
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((product) => (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  onEdit={() => handleEdit(product)}
                  onDelete={() => setDeleteConfirmId(product.id)}
                />

                {/* ── DELETE CONFIRM ── */}
                {deleteConfirmId === product.id && (
                  <div style={styles.confirmBox}>
                    <p style={styles.confirmText}>
                      Delete "{product.name}"? 💔
                    </p>
                    <div style={styles.confirmActions}>
                      <button
                        style={styles.confirmYes}
                        onClick={() => handleDelete(product.id)}
                      >
                        Yes, Delete
                      </button>
                      <button
                        style={styles.confirmNo}
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <p>© 2024 Cutie Collection. Made with 💕 for all cuties.</p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Poppins', sans-serif",
    background: "#fff",
    minHeight: "100vh",
    color: "#333",
  },
  // NAVBAR
  navbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 60px", background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)", borderBottom: "1.5px solid #fce4ec",
    position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "12px",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "28px" },
  navTitle: { fontSize: "20px", fontWeight: "700", color: "#e91e8c" },
  navLinks: { display: "flex", gap: "28px" },
  navLink: { textDecoration: "none", color: "#c2185b", fontSize: "14px", fontWeight: "500" },
  logoutBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "20px", padding: "8px 18px", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 4px 12px rgba(233,30,140,0.25)",
  },
  // PAGE HEADER
  pageHeader: {
    background: "linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)",
    padding: "60px 60px 50px", position: "relative", overflow: "hidden",
  },
  blob1: {
    position: "absolute", top: "-80px", right: "-60px", width: "280px", height: "280px",
    background: "radial-gradient(circle, #f8bbd0, #f48fb1)", borderRadius: "50%",
    opacity: 0.25, filter: "blur(50px)",
  },
  blob2: {
    position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px",
    background: "radial-gradient(circle, #fce4ec, #f8bbd0)", borderRadius: "50%",
    opacity: 0.3, filter: "blur(40px)",
  },
  headerContent: { position: "relative", zIndex: 1 },
  badge: {
    background: "#fff", color: "#e91e8c", border: "1.5px solid #f8bbd0",
    borderRadius: "20px", padding: "6px 16px", fontSize: "13px",
    fontWeight: "600", display: "inline-block", marginBottom: "16px",
  },
  pageTitle: { fontSize: "40px", fontWeight: "800", color: "#2d2d2d", marginBottom: "10px" },
  accent: { color: "#e91e8c" },
  pageSub: { fontSize: "15px", color: "#888", marginBottom: "28px" },
  addBtn: {
    background: "linear-gradient(135deg, #f06292, #e91e8c)", color: "#fff",
    border: "none", borderRadius: "14px", padding: "13px 28px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
    boxShadow: "0 6px 20px rgba(233,30,140,0.3)",
  },
  // CONTAINER
  container: { padding: "40px 60px", maxWidth: "1200px", margin: "0 auto" },
  // STATS
  statsRow: { display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" },
  statCard: {
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    border: "1.5px solid #f8bbd0", borderRadius: "18px",
    padding: "20px 28px", display: "flex", alignItems: "center",
    gap: "16px", flex: 1, minWidth: "160px",
  },
  statEmoji: { fontSize: "32px" },
  statNum: { fontSize: "24px", fontWeight: "700", color: "#e91e8c" },
  statLabel: { fontSize: "12px", color: "#f48fb1", fontWeight: "500" },
  // LIST
  listTitle: { fontSize: "22px", fontWeight: "700", color: "#e91e8c", marginBottom: "24px" },
  // GRID
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  // DELETE CONFIRM
  confirmBox: {
    marginTop: "12px", background: "#fff5f8",
    borderRadius: "14px", padding: "16px", border: "1.5px solid #f8bbd0",
  },
  confirmText: { fontSize: "13px", color: "#c2185b", fontWeight: "600", marginBottom: "12px" },
  confirmActions: { display: "flex", gap: "8px" },
  confirmYes: {
    background: "#e91e8c", color: "#fff", border: "none",
    borderRadius: "10px", padding: "8px 18px", fontSize: "12px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  },
  confirmNo: {
    background: "#fff", color: "#c2185b", border: "1.5px solid #f8bbd0",
    borderRadius: "10px", padding: "8px 16px", fontSize: "12px",
    fontWeight: "600", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
  },
  // EMPTY STATE
  emptyState: {
    textAlign: "center", padding: "60px 20px",
    background: "linear-gradient(135deg, #fff0f5, #fce4ec)",
    borderRadius: "24px", border: "1.5px solid #f8bbd0",
  },
  emptyText: { fontSize: "20px", fontWeight: "700", color: "#e91e8c", marginTop: "16px" },
  emptySub: { fontSize: "14px", color: "#f48fb1", marginBottom: "24px" },
  // FOOTER
  footer: {
    background: "#2d2d2d", textAlign: "center",
    padding: "24px", fontSize: "13px", color: "#666", marginTop: "60px",
  },
};
