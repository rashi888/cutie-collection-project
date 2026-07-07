import axios from "axios";

const API_URL = "http://localhost:8080/api/payments";

const PaymentService = {

  createOrder(amount) {
    return axios.post(
      `${API_URL}/create-order`,
      { amount }
    );
  },

  savePayment(paymentData) {
    return axios.post(
      `${API_URL}/success`,
      paymentData
    );
  },

  getAllPayments() {
    return axios.get(API_URL);
  }
};

export default PaymentService;