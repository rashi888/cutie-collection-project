package com.cutie.collection.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.dto.UpdateOrderStatusRequest;
import com.cutie.collection.backend.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(
            OrderService orderService) {

        this.orderService = orderService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<OrderResponse>>
            getRecentOrders() {

        return ResponseEntity.ok(
                orderService.getRecentOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse>
            getOrderById(
                    @PathVariable
                    Long orderId) {

        return ResponseEntity.ok(
                orderService
                        .getOrderByIdForAdmin(
                                orderId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse>
            updateOrderStatus(
                    @PathVariable
                    Long orderId,
                    @Valid
                    @RequestBody
                    UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        orderId,
                        request.getStatus()));
    }
}