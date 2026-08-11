package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.OrderRequest;
import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.service.CurrentUserService;
import com.cutie.collection.backend.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CurrentUserService currentUserService;

    public OrderController(
            OrderService orderService,
            CurrentUserService currentUserService) {

        this.orderService = orderService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @Valid
            @RequestBody
            OrderRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        OrderResponse response =
                orderService.createOrder(
                        userId,
                        request);

        return ResponseEntity
                .created(
                        URI.create(
                                "/api/orders/"
                                        + response.getId()))
                .body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>>
            getMyOrders(
                    Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                orderService.getMyOrders(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse>
            getMyOrderById(
                    Authentication authentication,
                    @PathVariable
                    Long orderId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                orderService.getMyOrderById(
                        userId,
                        orderId));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse>
            cancelOrder(
                    Authentication authentication,
                    @PathVariable
                    Long orderId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                orderService.cancelOrder(
                        userId,
                        orderId));
    }
}