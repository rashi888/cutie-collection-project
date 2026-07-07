package com.cutie.collection.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cutie.collection.backend.dto.PaymentResponse;
import com.cutie.collection.backend.dto.PaymentSuccessRequest;
import com.cutie.collection.backend.entity.Payment;
import com.cutie.collection.backend.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@Service
public class PaymentService {
	
	private final PaymentRepository paymentRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public PaymentResponse createOrder(
            BigDecimal amount)
            throws Exception {

        RazorpayClient client =
                new RazorpayClient(
                        keyId,
                        keySecret);

        JSONObject options =
                new JSONObject();

        options.put(
                "amount",
                amount.multiply(
                        BigDecimal.valueOf(100))
                        .intValue());

        options.put("currency", "INR");

        Order order =
                client.orders.create(options);

        return new PaymentResponse(
                order.get("id"),
                order.get("amount"),
                order.get("currency"));
    }
    
    public void savePayment(
            PaymentSuccessRequest request) {

        System.out.println("PAYMENT SAVE API HIT");

        Payment payment = new Payment();

        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId());

        payment.setRazorpayOrderId(
                request.getRazorpayOrderId());

        payment.setAmount(
                request.getAmount());

        payment.setPaymentStatus("PAID");

        payment.setPaymentDate(
                LocalDateTime.now());

        paymentRepository.save(payment);

        System.out.println("PAYMENT SAVED TO DB");
    }
    
    public java.util.List<Payment> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .sorted((p1, p2) ->
                        p2.getPaymentDate()
                          .compareTo(
                                  p1.getPaymentDate()))
                .toList();
    }
    
    

}