import api from "./axiosConfig";

const BASE_URL = "/api/products";

const ProductService = {
  getAll: () => api.get(BASE_URL),
  getById: (id) => api.get(`${BASE_URL}/${id}`),
  getByCategory: (categoryId) => api.get(`${BASE_URL}/category/${categoryId}`),
  create: (data) => api.post(BASE_URL, data),
  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),
  delete: (id) => api.delete(`${BASE_URL}/${id}`),
  getById: (id) => api.get(`/api/products/${id}`)
};

export default ProductService;