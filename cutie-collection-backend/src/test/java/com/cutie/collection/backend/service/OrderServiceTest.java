package com.cutie.collection.backend.service;

import com.cutie.collection.backend.dto.OrderRequest;
import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.entity.*;
import com.cutie.collection.backend.repository.CartRepository;
import com.cutie.collection.backend.repository.OrderRepository;
import com.cutie.collection.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartRepository cartRepository;
    @Mock UserRepository userRepository;

    @InjectMocks OrderService orderService;

    private User user;
    private Product product;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        user = new User("Rashi", "rashi@example.com", "hashed");
        user.setId(1L);

        product = new Product();
        product.setId(10L);
        product.setName("Cute Bear");
        product.setPrice(new BigDecimal("19.99"));
        product.setImageUrl("http://img.test/bear.png");

        cartItem = new CartItem();
        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
    }

    @Test
    void createOrder_success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(List.of(cartItem));

        Order savedOrder = new Order();
        savedOrder.setId(100L);
        savedOrder.setUser(user);
        savedOrder.setOrderStatus("PENDING");
        savedOrder.setTotalAmount(new BigDecimal("39.98"));
        savedOrder.setCreatedAt(LocalDateTime.now());

        OrderItem oi = new OrderItem();
        oi.setProduct(product);
        oi.setQuantity(2);
        oi.setPrice(product.getPrice());
        oi.setSubtotal(new BigDecimal("39.98"));
        savedOrder.setItems(List.of(oi));

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        OrderResponse response = orderService.createOrder(1L, new OrderRequest());

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo("PENDING");
        verify(cartRepository).deleteAll(List.of(cartItem));
    }

    @Test
    void createOrder_emptyCart_throwsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserId(1L)).thenReturn(List.of());

        assertThatThrownBy(() -> orderService.createOrder(1L, new OrderRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cart is empty");
    }

    @Test
    void createOrder_userNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(99L, new OrderRequest()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void getMyOrders_returnsList() {
        Order order = new Order();
        order.setId(1L);
        order.setOrderStatus("PENDING");
        order.setTotalAmount(BigDecimal.TEN);
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        when(orderRepository.findByUserId(1L)).thenReturn(List.of(order));

        List<OrderResponse> result = orderService.getMyOrders(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo("PENDING");
    }

    @Test
    void getOrderById_found_returnsResponse() {
        Order order = new Order();
        order.setId(5L);
        order.setOrderStatus("DELIVERED");
        order.setTotalAmount(BigDecimal.TEN);
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(5L);

        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getStatus()).isEqualTo("DELIVERED");
    }

    @Test
    void getOrderById_notFound_throwsException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Order not found");
    }

    @Test
    void cancelOrder_pendingOrder_statusSetToCancelled() {
        Order order = new Order();
        order.setId(3L);
        order.setOrderStatus("PENDING");
        order.setTotalAmount(BigDecimal.TEN);
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(new ArrayList<>());

        when(orderRepository.findById(3L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        OrderResponse response = orderService.cancelOrder(3L);

        assertThat(response.getStatus()).isEqualTo("CANCELLED");
        verify(orderRepository).save(order);
    }

    @Test
    void cancelOrder_deliveredOrder_throwsException() {
        Order order = new Order();
        order.setId(4L);
        order.setOrderStatus("DELIVERED");

        when(orderRepository.findById(4L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder(4L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Delivered orders cannot be cancelled");
    }
}