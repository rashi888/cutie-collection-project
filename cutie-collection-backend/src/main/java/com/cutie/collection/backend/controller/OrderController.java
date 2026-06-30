package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cutie.collection.backend.dto.OrderRequest;
import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(
            OrderService orderService) {
        this.orderService = orderService;
    }

    // Temporary until JWT integration
    private static final Long USER_ID = 1L;

    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder() {

        OrderResponse response =
                orderService.createOrder(
                        USER_ID,
                        new OrderRequest());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>>
            getMyOrders() {

        return ResponseEntity.ok(
                orderService.getMyOrders(USER_ID));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse>
            getOrderById(
                    @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId));
    }

    @DeleteMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse>
            cancelOrder(
                    @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.cancelOrder(orderId));
    }
}