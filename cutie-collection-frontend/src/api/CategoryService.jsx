import api from "./axiosConfig";

const PUBLIC_BASE_URL = "/api/categories";
const ADMIN_BASE_URL = "/api/admin/categories";

const CategoryService = {
  getAll: () => api.get(PUBLIC_BASE_URL),

  getById: (categoryId) =>
    api.get(`${PUBLIC_BASE_URL}/${categoryId}`),

  getAllForAdmin: () => api.get(ADMIN_BASE_URL),

  getByIdForAdmin: (categoryId) =>
    api.get(`${ADMIN_BASE_URL}/${categoryId}`),

  create: (data) => api.post(ADMIN_BASE_URL, data),

  update: (categoryId, data) =>
    api.put(`${ADMIN_BASE_URL}/${categoryId}`, data),

  activate: (categoryId) =>
    api.patch(`${ADMIN_BASE_URL}/${categoryId}/activate`),

  deactivate: (categoryId) =>
    api.patch(`${ADMIN_BASE_URL}/${categoryId}/deactivate`),

  remove: (categoryId) =>
    api.delete(`${ADMIN_BASE_URL}/${categoryId}`),
};

export default CategoryService;