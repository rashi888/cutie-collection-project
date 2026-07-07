import { useEffect, useState } from "react";
import PaymentService from "../api/PaymentService";
import OrderService from "../api/OrderService";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    <p>Total Payments: {payments.length}</p>;
    try {
      const res = await PaymentService.getAllPayments();

      console.log("Payments:", res.data);

      setPayments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          color: "#e91e8c",
          marginBottom: "30px",
        }}
      >
        💳 Payment History
      </h1>

      {payments.length > 0 ? (
        payments.map((payment) => (
          <div
            key={payment.id}
            style={{
              border: "2px solid #f8bbd0",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "20px",
              background: "#fffafc",
            }}
          >
            <h3>✅ {payment.paymentStatus || "PAID"}</h3>

            <p>
              <strong>Payment ID:</strong> {payment.razorpayPaymentId || "N/A"}
            </p>

            <p>
              <strong>Order ID:</strong> {payment.razorpayOrderId || "N/A"}
            </p>

            <p>
              <strong>Amount:</strong> ₹{payment.amount ?? 0}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ))
      ) : (
        <p>No payment history found 💳</p>
      )}
    </div>
  );
}
