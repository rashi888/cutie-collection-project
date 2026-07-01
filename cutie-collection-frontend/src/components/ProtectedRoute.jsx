import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role"); // "ADMIN" or "USER"

  // Not logged in → redirect to login
  if (!token) return <Navigate to="/login" />;

  // Admin-only page but user is not ADMIN → redirect home
  if (adminOnly && role !== "ADMIN") return <Navigate to="/" />;

  return children;
}