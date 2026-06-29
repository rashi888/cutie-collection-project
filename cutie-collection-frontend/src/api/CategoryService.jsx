import api from "./axiosConfig";

const BASE_URL = "/api/categories";

const CategoryService = {
  getAll: () => api.get(BASE_URL),

  getById: (id) => api.get(`${BASE_URL}/${id}`),

  create: (data) => api.post(BASE_URL, data),

  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),

  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

export default CategoryService;