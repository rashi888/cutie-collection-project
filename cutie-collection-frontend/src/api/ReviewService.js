import axios from "axios";

const API_URL = "http://localhost:8080/api/reviews";

const ReviewService = {

  addReview(review) {
    return axios.post(API_URL, review);
  },

  getReviewsByProduct(productId) {
    return axios.get(
      `${API_URL}/product/${productId}`
    );
  }

};

export default ReviewService;