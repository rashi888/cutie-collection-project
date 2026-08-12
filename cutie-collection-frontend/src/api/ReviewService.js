import api from "./axiosConfig";

const ReviewService = {
  getReviewsByProduct: (productId) =>
    api.get(`/api/products/${productId}/reviews`),

  getAverageRating: (productId) =>
    api.get(`/api/products/${productId}/reviews/average`),

  addReview: (productId, reviewData) =>
    api.post(
      `/api/products/${productId}/reviews`,
      reviewData
    ),

  updateReview: (reviewId, reviewData) =>
    api.put(`/api/reviews/${reviewId}`, reviewData),

  deleteReview: (reviewId) =>
    api.delete(`/api/reviews/${reviewId}`),
};

export default ReviewService;