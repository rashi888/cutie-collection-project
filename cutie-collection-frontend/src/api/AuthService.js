import api from "./axiosConfig";

const BASE_URL = "/api/auth";

const AuthService = {
  login: (credentials) =>
    api.post(`${BASE_URL}/login`, credentials),

  signup: (userData) =>
    api.post(`${BASE_URL}/signup`, userData),

  getCurrentUser: () =>
    api.get("/api/users/me"),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default AuthService;