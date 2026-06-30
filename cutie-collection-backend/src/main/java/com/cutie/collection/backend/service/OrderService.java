package com.cutie.collection.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.OrderItemResponse;
import com.cutie.collection.backend.dto.OrderRequest;
import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.entity.CartItem;
import com.cutie.collection.backend.entity.Order;
import com.cutie.collection.backend.entity.OrderItem;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.CartRepository;
import com.cutie.collection.backend.repository.OrderRepository;
import com.cutie.collection.backend.repository.UserRepository;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    public OrderResponse createOrder(
            Long userId,
            OrderRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<CartItem> cartItems =
                cartRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException(
                    "Cart is empty");
        }

        Order order = new Order();

        order.setUser(user);
        order.setOrderStatus("PENDING");

        List<OrderItem> orderItems =
                new ArrayList<>();

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);

            orderItem.setProduct(
                    cartItem.getProduct());

            orderItem.setQuantity(
                    cartItem.getQuantity());

            orderItem.setPrice(
                    cartItem.getProduct()
                            .getPrice());

            BigDecimal subtotal =
                    cartItem.getProduct()
                            .getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            cartItem.getQuantity()));

            orderItem.setSubtotal(
                    subtotal);

            totalAmount =
                    totalAmount.add(subtotal);

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);

        order.setTotalAmount(
                totalAmount);

        Order savedOrder =
                orderRepository.save(order);

        // Clear cart after successful checkout
        cartRepository.deleteAll(cartItems);

        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getMyOrders(
            Long userId) {

        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderById(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        return mapToResponse(order);
    }

    public OrderResponse cancelOrder(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        if ("DELIVERED".equals(order.getOrderStatus())) {
            throw new RuntimeException(
                    "Delivered orders cannot be cancelled");
        }

        order.setOrderStatus(
                "CANCELLED");

        Order updatedOrder =
                orderRepository.save(order);

        return mapToResponse(updatedOrder);
    }

    private OrderResponse mapToResponse(
            Order order) {

        OrderResponse response =
                new OrderResponse();

        response.setId(
                order.getId());

        response.setTotalAmount(
                order.getTotalAmount());

        response.setStatus(
                order.getOrderStatus());

        response.setCreatedAt(
                order.getCreatedAt());

        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(item -> {

                            OrderItemResponse dto =
                                    new OrderItemResponse();

                            dto.setProductId(
                                    item.getProduct().getId());

                            dto.setProductName(
                                    item.getProduct().getName());

                            dto.setImageUrl(
                                    item.getProduct().getImageUrl());

                            dto.setQuantity(
                                    item.getQuantity());

                            dto.setPrice(
                                    item.getPrice());

                            dto.setSubtotal(
                                    item.getSubtotal());

                            return dto;
                        })
                        .toList();

        response.setItems(itemResponses);

        return response;
    }
}