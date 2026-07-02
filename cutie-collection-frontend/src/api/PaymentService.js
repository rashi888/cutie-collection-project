import api from "./axiosConfig";

const PaymentService = {

  createOrder: (amount) => {
    console.log(localStorage.getItem("token"));

    return api.post("/api/payments/create-order", {
      amount,
    });
  },

  savePayment: (data) => {
    return api.post("/api/payments/success", data);
  },

};

export default PaymentService;