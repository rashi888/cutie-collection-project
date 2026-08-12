import api from "./axiosConfig";

const BASE_URL = "/api/orders";
const ADMIN_BASE_URL = "/api/admin/orders";

const OrderService = {
  placeOrder: (addressId) =>
    api.post(BASE_URL, {
      addressId,
    }),

  getMyOrders: () => api.get(`${BASE_URL}/my`),

  getOrderById: (orderId) =>
    api.get(`${BASE_URL}/${orderId}`),

  cancelOrder: (orderId) =>
    api.patch(`${BASE_URL}/${orderId}/cancel`),

  getRecentOrdersForAdmin: () =>
    api.get(`${ADMIN_BASE_URL}/recent`),

  getOrderByIdForAdmin: (orderId) =>
    api.get(`${ADMIN_BASE_URL}/${orderId}`),

  updateOrderStatus: (orderId, status) =>
    api.patch(`${ADMIN_BASE_URL}/${orderId}/status`, {
      status,
    }),
};

export default OrderService;