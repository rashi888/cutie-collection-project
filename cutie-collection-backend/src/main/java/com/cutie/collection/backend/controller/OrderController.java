package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.cutie.collection.backend.dto.OrderRequest;
import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService,
                           UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    // ✅ Helper: get logged-in user's ID from JWT
    private Long getLoggedInUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // Place order from cart
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getLoggedInUserId(userDetails);
        return ResponseEntity.ok(
                orderService.createOrder(userId, new OrderRequest()));
    }

    // Get my orders
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = getLoggedInUserId(userDetails);
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // Cancel order
    @DeleteMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.cancelOrder(orderId));
    }
}