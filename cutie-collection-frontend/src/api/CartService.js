import api from "./axiosConfig";

const BASE_URL = "/api/cart";

const CartService = {
  getCart: () => api.get(BASE_URL),
  addItem: (data) => api.post(`${BASE_URL}/add`, data),
  updateItem: (itemId, data) => api.put(`${BASE_URL}/update/${itemId}`, data),
  removeItem: (itemId) => api.delete(`${BASE_URL}/remove/${itemId}`),
  clearCart: () => api.delete(`${BASE_URL}/clear`),
};

export default CartService;
