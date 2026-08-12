import {
  Navigate,
  useLocation,
} from "react-router-dom";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}) {
  const location = useLocation();

  const token =
    localStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user");

  // No token means the user is not logged in.
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      // Remove invalid authentication data.
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
  }

  /*
   * Admin pages require valid user information
   * with the ADMIN role.
   */
  if (adminOnly && user?.role !== "ADMIN") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}