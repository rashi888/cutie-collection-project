import api from "./axiosConfig";

const BASE_URL = "/api/wishlist";

const WishlistService = {
  getWishlist:      ()           => api.get(BASE_URL),
  addToWishlist:    (productId)  => api.post(`${BASE_URL}/add/${productId}`),
  removeFromWishlist: (productId) => api.delete(`${BASE_URL}/remove/${productId}`),
  clearWishlist:    ()           => api.delete(`${BASE_URL}/clear`),
};

export default WishlistService;