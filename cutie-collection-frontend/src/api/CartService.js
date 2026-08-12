import api from "./axiosConfig";

const BASE_URL = "/api/cart";

const CartService = {
  getCart: () => api.get(BASE_URL),

  getCount: () => api.get(`${BASE_URL}/count`),

  addItem: (data) => api.post(`${BASE_URL}/items`, data),

  updateItem: (cartItemId, data) =>
    api.put(`${BASE_URL}/items/${cartItemId}`, data),

  removeItem: (cartItemId) =>
    api.delete(`${BASE_URL}/items/${cartItemId}`),

  removeProduct: (productId) =>
    api.delete(`${BASE_URL}/products/${productId}`),

  clearCart: () => api.delete(BASE_URL),
};

export default CartService;