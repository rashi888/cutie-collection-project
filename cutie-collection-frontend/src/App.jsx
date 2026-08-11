import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";

import ProtectedRoute from "./components/ProtectedRoute";

import CartPage from "./pages/CartPage";
import CategoryPage from "./pages/CategoryPage";
import CheckoutPage from "./pages/CheckoutPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ManageCategories from "./pages/ManageCategories";
import ManageProducts from "./pages/ManageProducts";
import OrdersPage from "./pages/OrdersPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductPage from "./pages/ProductPage";
import Signup from "./pages/Signup";
import WishlistPage from "./pages/WishlistPage";

import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route
          path="/products/:productId"
          element={<ProductDetailsPage />}
        />

        {/* Authenticated customer pages */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Administrator pages */}
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <ManageCategories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly>
              <ManageProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute adminOnly>
              <PaymentHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Temporary redirects for old frontend URLs */}
        <Route
          path="/manage-categories"
          element={<Navigate to="/admin/categories" replace />}
        />

        <Route
          path="/manage-products"
          element={<Navigate to="/admin/products" replace />}
        />

        <Route
          path="/payments"
          element={<Navigate to="/admin/payments" replace />}
        />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;