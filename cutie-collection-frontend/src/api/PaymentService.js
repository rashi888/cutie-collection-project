import api from "./axiosConfig";

const BASE_URL = "/api/payments";
const ADMIN_BASE_URL = "/api/admin/payments";

const PaymentService = {
  createPaymentOrder: (applicationOrderId) =>
    api.post(`${BASE_URL}/create-order`, {
      orderId: applicationOrderId,
    }),

  verifyPayment: ({
    applicationOrderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) =>
    api.post(`${BASE_URL}/verify`, {
      applicationOrderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }),

  getAllPaymentsForAdmin: () =>
    api.get(ADMIN_BASE_URL),
};

export default PaymentService;