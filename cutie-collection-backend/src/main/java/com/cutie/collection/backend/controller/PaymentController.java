package com.cutie.collection.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.PaymentRequest;
import com.cutie.collection.backend.dto.PaymentResponse;
import com.cutie.collection.backend.dto.PaymentSuccessRequest;
import com.cutie.collection.backend.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse>
            createOrder(
                    @RequestBody PaymentRequest request)
            throws Exception {

        System.out.println("PAYMENT API HIT");

        return ResponseEntity.ok(
                paymentService.createOrder(
                        request.getAmount()));
    }
    @PostMapping("/success")
    public ResponseEntity<String>
    savePayment(
    @RequestBody PaymentSuccessRequest request) {

        paymentService.savePayment(
            request
        );

        return ResponseEntity.ok(
            "Payment Saved"
        );
    }
}