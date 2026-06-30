import api from "./axiosConfig";

const BASE_URL = "/api/orders";

const OrderService = {
  placeOrder: () => api.post(`${BASE_URL}/place`),
  getMyOrders: () => api.get(`${BASE_URL}/my`),
  getOrderById: (orderId) => api.get(`${BASE_URL}/${orderId}`),
  cancelOrder: (orderId) => api.delete(`${BASE_URL}/${orderId}/cancel`),
};

export default OrderService;