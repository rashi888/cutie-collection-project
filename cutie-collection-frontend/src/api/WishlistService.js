import api from "./axiosConfig";

const BASE_URL = "/api/wishlist";

const WishlistService = {
  getWishlist: () => api.get(BASE_URL),

  getCount: () => api.get(`${BASE_URL}/count`),

  addToWishlist: (productId) =>
    api.post(`${BASE_URL}/${productId}`),

  removeFromWishlist: (productId) =>
    api.delete(`${BASE_URL}/${productId}`),

  clearWishlist: () => api.delete(BASE_URL),
};

export default WishlistService;