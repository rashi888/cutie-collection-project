package com.cutie.collection.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.PaymentRequest;
import com.cutie.collection.backend.dto.PaymentResponse;
import com.cutie.collection.backend.dto.VerifyPaymentRequest;
import com.cutie.collection.backend.service.CurrentUserService;
import com.cutie.collection.backend.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentUserService currentUserService;

    public PaymentController(
            PaymentService paymentService,
            CurrentUserService currentUserService) {

        this.paymentService = paymentService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse>
            createPaymentOrder(
                    Authentication authentication,
                    @Valid
                    @RequestBody
                    PaymentRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                paymentService.createPaymentOrder(
                        userId,
                        request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse>
            verifyPayment(
                    Authentication authentication,
                    @Valid
                    @RequestBody
                    VerifyPaymentRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                paymentService.verifyPayment(
                        userId,
                        request));
    }
}