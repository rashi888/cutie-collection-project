package com.cutie.collection.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.PaymentRequest;
import com.cutie.collection.backend.dto.PaymentResponse;
import com.cutie.collection.backend.dto.VerifyPaymentRequest;
import com.cutie.collection.backend.entity.OrderStatus;
import com.cutie.collection.backend.entity.Payment;
import com.cutie.collection.backend.entity.PaymentStatus;
import com.cutie.collection.backend.exception.BadRequestException;
import com.cutie.collection.backend.exception.ConflictException;
import com.cutie.collection.backend.exception.OrderNotFoundException;
import com.cutie.collection.backend.exception.PaymentException;
import com.cutie.collection.backend.repository.OrderRepository;
import com.cutie.collection.backend.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class PaymentService {

    private static final String CURRENCY = "INR";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final String keyId;
    private final String keySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @Transactional
    public PaymentResponse createPaymentOrder(
            Long userId,
            PaymentRequest request) {

        com.cutie.collection.backend.entity.Order applicationOrder =
                orderRepository
                        .findByIdAndUserId(
                                request.getOrderId(),
                                userId)
                        .orElseThrow(() ->
                                new OrderNotFoundException(
                                        request.getOrderId()));

        if (applicationOrder.getOrderStatus()
                == OrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Payment cannot be created for a cancelled order");
        }

        if (applicationOrder.getPaymentStatus()
                == PaymentStatus.PAID) {

            throw new ConflictException(
                    "Order has already been paid");
        }

        if (paymentRepository.existsByOrderId(
                applicationOrder.getId())) {

            Payment existingPayment =
                    paymentRepository
                            .findByOrderId(
                                    applicationOrder.getId())
                            .orElseThrow(() ->
                                    new PaymentException(
                                            "Payment record could not be loaded"));

            if (existingPayment.getPaymentStatus()
                    == PaymentStatus.CREATED) {

                return mapToResponse(existingPayment);
            }

            throw new ConflictException(
                    "A payment already exists for this order");
        }

        BigDecimal amount =
                applicationOrder.getTotalAmount();

        long amountInPaise =
                convertToPaise(amount);

        try {
            RazorpayClient client =
                    new RazorpayClient(
                            keyId,
                            keySecret);

            JSONObject options =
                    new JSONObject();

            options.put(
                    "amount",
                    amountInPaise);

            options.put(
                    "currency",
                    CURRENCY);

            options.put(
                    "receipt",
                    applicationOrder.getOrderNumber());

            com.razorpay.Order razorpayOrder =
                    client.orders.create(options);

            String razorpayOrderId =
                    razorpayOrder.get("id");

            Payment payment =
                    new Payment(
                            applicationOrder,
                            amount);

            payment.setCurrency(CURRENCY);
            payment.markCreated(
                    razorpayOrderId);

            applicationOrder.assignPayment(payment);
            applicationOrder.setPaymentStatus(
                    PaymentStatus.CREATED);

            Payment savedPayment =
                    paymentRepository.save(payment);

            orderRepository.save(applicationOrder);

            return mapToResponse(savedPayment);

        } catch (Exception exception) {

            throw new PaymentException(
                    "Unable to create payment order",
                    exception);
        }
    }

    @Transactional
    public PaymentResponse verifyPayment(
            Long userId,
            VerifyPaymentRequest request) {

        com.cutie.collection.backend.entity.Order applicationOrder =
                orderRepository
                        .findByIdAndUserId(
                                request.getApplicationOrderId(),
                                userId)
                        .orElseThrow(() ->
                                new OrderNotFoundException(
                                        request.getApplicationOrderId()));

        Payment payment = paymentRepository
                .findByOrderIdAndOrderUserId(
                        applicationOrder.getId(),
                        userId)
                .orElseThrow(() ->
                        new PaymentException(
                                "Payment record not found"));

        if (!request.getRazorpayOrderId()
                .equals(payment.getRazorpayOrderId())) {

            throw new PaymentException(
                    "Razorpay order ID does not match");
        }

        if (payment.getPaymentStatus()
                == PaymentStatus.PAID) {

            /*
             * Idempotent response for duplicate verification requests.
             */
            return mapToResponse(payment);
        }

        try {
            JSONObject verificationAttributes =
                    new JSONObject();

            verificationAttributes.put(
                    "razorpay_order_id",
                    request.getRazorpayOrderId());

            verificationAttributes.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId());

            verificationAttributes.put(
                    "razorpay_signature",
                    request.getRazorpaySignature());

            boolean signatureValid =
                    Utils.verifyPaymentSignature(
                            verificationAttributes,
                            keySecret);

            if (!signatureValid) {

                payment.markFailed();
                paymentRepository.save(payment);

                throw new PaymentException(
                        "Payment signature verification failed");
            }

            if (paymentRepository
                    .existsByRazorpayPaymentId(
                            request.getRazorpayPaymentId())) {

                throw new ConflictException(
                        "Payment has already been processed");
            }

            payment.markPaid(
                    request.getRazorpayPaymentId());

            Payment savedPayment =
                    paymentRepository.save(payment);

            orderRepository.save(applicationOrder);

            return mapToResponse(savedPayment);

        } catch (ConflictException
                | PaymentException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new PaymentException(
                    "Payment verification failed",
                    exception);
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private long convertToPaise(
            BigDecimal amount) {

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new PaymentException(
                    "Payment amount must be greater than zero");
        }

        try {
            return amount
                    .setScale(
                            2,
                            RoundingMode.HALF_UP)
                    .movePointRight(2)
                    .longValueExact();

        } catch (ArithmeticException exception) {

            throw new PaymentException(
                    "Payment amount is invalid",
                    exception);
        }
    }

    private PaymentResponse mapToResponse(
            Payment payment) {

        return new PaymentResponse(
                payment.getOrder().getId(),
                payment.getOrder().getOrderNumber(),
                payment.getRazorpayOrderId(),
                convertToPaise(payment.getAmount()),
                payment.getAmount(),
                payment.getCurrency(),
                keyId,
                payment.getPaymentStatus()
        );
    }
}