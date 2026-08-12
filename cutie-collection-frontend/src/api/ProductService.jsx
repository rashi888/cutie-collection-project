import api from "./axiosConfig";

const PUBLIC_BASE_URL = "/api/products";
const ADMIN_BASE_URL = "/api/admin/products";

const ProductService = {
  getAll: () => api.get(PUBLIC_BASE_URL),

  getById: (productId) =>
    api.get(`${PUBLIC_BASE_URL}/${productId}`),

  getProductById: (productId) =>
    api.get(`${PUBLIC_BASE_URL}/${productId}`),

  getByCategory: (categoryId) =>
    api.get(`${PUBLIC_BASE_URL}/category/${categoryId}`),

  getPagedProducts: ({
    page = 0,
    size = 12,
    sortBy = "createdAt",
    direction = "desc",
  } = {}) =>
    api.get(`${PUBLIC_BASE_URL}/paged`, {
      params: {
        page,
        size,
        sortBy,
        direction,
      },
    }),

  searchByKeyword: (keyword) =>
    api.get(`${PUBLIC_BASE_URL}/search`, {
      params: {
        keyword,
      },
    }),

  getAllForAdmin: () => api.get(ADMIN_BASE_URL),

  getByIdForAdmin: (productId) =>
    api.get(`${ADMIN_BASE_URL}/${productId}`),

  create: (data) => api.post(ADMIN_BASE_URL, data),

  update: (productId, data) =>
    api.put(`${ADMIN_BASE_URL}/${productId}`, data),

  activate: (productId) =>
    api.patch(`${ADMIN_BASE_URL}/${productId}/activate`),

  remove: (productId) =>
    api.delete(`${ADMIN_BASE_URL}/${productId}`),

  delete: (productId) =>
    api.delete(`${ADMIN_BASE_URL}/${productId}`),
};

export default ProductService;