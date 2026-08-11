package com.cutie.collection.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.OrderItemResponse;
import com.cutie.collection.backend.dto.OrderRequest;
import com.cutie.collection.backend.dto.OrderResponse;
import com.cutie.collection.backend.dto.ShippingAddressResponse;
import com.cutie.collection.backend.entity.Address;
import com.cutie.collection.backend.entity.CartItem;
import com.cutie.collection.backend.entity.Order;
import com.cutie.collection.backend.entity.OrderItem;
import com.cutie.collection.backend.entity.OrderStatus;
import com.cutie.collection.backend.entity.PaymentStatus;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.exception.BadRequestException;
import com.cutie.collection.backend.exception.InsufficientStockException;
import com.cutie.collection.backend.exception.OrderNotFoundException;
import com.cutie.collection.backend.exception.ResourceNotFoundException;
import com.cutie.collection.backend.repository.AddressRepository;
import com.cutie.collection.backend.repository.CartRepository;
import com.cutie.collection.backend.repository.OrderRepository;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;

@Service
public class OrderService {

    private static final int MONEY_SCALE = 2;

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(
            Long userId,
            OrderRequest request) {

        User user = findActiveUser(userId);

        Address address = addressRepository
                .findByIdAndUserIdAndActiveTrue(
                        request.getAddressId(),
                        userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Shipping address not found"));

        List<CartItem> cartItems =
                cartRepository
                        .findAllByUserIdOrderByCreatedAtDesc(
                                userId);

        if (cartItems.isEmpty()) {
            throw new BadRequestException(
                    "Cart cannot be empty");
        }

        Order order = new Order(user);

        order.setOrderStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        copyShippingAddress(order, address);

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            Product product =
                    cartItem.getProduct();

            validateProductForOrder(
                    product,
                    cartItem.getQuantity());

            /*
             * Copy product information into the order item before
             * changing stock.
             */
            OrderItem orderItem =
                    new OrderItem(
                            product,
                            cartItem.getQuantity(),
                            product.getPrice());

            order.addItem(orderItem);

            totalAmount = totalAmount.add(
                    orderItem.getSubtotal());

            /*
             * Stock reduction is part of the same transaction.
             * If anything fails, all changes are rolled back.
             */
            product.reduceStock(
                    cartItem.getQuantity());

            productRepository.save(product);
        }

        order.setTotalAmount(
                totalAmount.setScale(
                        MONEY_SCALE,
                        RoundingMode.HALF_UP));

        Order savedOrder =
                orderRepository.save(order);

        cartRepository.deleteAllByUserId(userId);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(
            Long userId) {

        return orderRepository
                .findAllByUserIdOrderByCreatedAtDesc(
                        userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(
            Long userId,
            Long orderId) {

        Order order = orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId)
                .orElseThrow(() ->
                        new OrderNotFoundException(orderId));

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForAdmin(
            Long orderId) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(orderId));

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(
            Long userId,
            Long orderId) {

        Order order = orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId)
                .orElseThrow(() ->
                        new OrderNotFoundException(orderId));

        if (order.getOrderStatus()
                == OrderStatus.CANCELLED) {

            throw new BadRequestException(
                    "Order is already cancelled");
        }

        if (order.getOrderStatus()
                == OrderStatus.SHIPPED
                || order.getOrderStatus()
                == OrderStatus.DELIVERED) {

            throw new BadRequestException(
                    "Shipped or delivered orders cannot be cancelled");
        }

        restoreOrderStock(order);

        order.setOrderStatus(
                OrderStatus.CANCELLED);

        return mapToResponse(
                orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus newStatus) {

        if (newStatus == null) {
            throw new BadRequestException(
                    "Order status is required");
        }

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new OrderNotFoundException(orderId));

        validateStatusTransition(
                order.getOrderStatus(),
                newStatus);

        if (newStatus == OrderStatus.CANCELLED
                && order.getOrderStatus()
                != OrderStatus.CANCELLED) {

            restoreOrderStock(order);
        }

        order.setOrderStatus(newStatus);

        return mapToResponse(
                orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRecentOrders() {

        return orderRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validateProductForOrder(
            Product product,
            Integer requestedQuantity) {

        if (!product.isActive()) {
            throw new BadRequestException(
                    "Product is no longer available: "
                            + product.getName());
        }

        if (requestedQuantity == null
                || requestedQuantity <= 0) {

            throw new BadRequestException(
                    "Order quantity must be greater than zero");
        }

        if (product.getStockQuantity()
                < requestedQuantity) {

            throw new InsufficientStockException(
                    product.getName(),
                    requestedQuantity,
                    product.getStockQuantity());
        }
    }

    private void restoreOrderStock(Order order) {

        for (OrderItem item : order.getItems()) {

            Product product = item.getProduct();

            product.increaseStock(
                    item.getQuantity());

            productRepository.save(product);
        }
    }

    private void validateStatusTransition(
            OrderStatus currentStatus,
            OrderStatus newStatus) {

        if (currentStatus == newStatus) {
            return;
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cancelled orders cannot change status");
        }

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException(
                    "Delivered orders cannot change status");
        }

        if (newStatus == OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Order cannot return to pending status");
        }
    }

    private User findActiveUser(Long userId) {

        return userRepository
                .findById(userId)
                .filter(User::isActive)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                userId));
    }

    private void copyShippingAddress(
            Order order,
            Address address) {

        order.setShippingFullName(
                address.getFullName());

        order.setShippingPhoneNumber(
                address.getPhoneNumber());

        order.setShippingAddressLine1(
                address.getAddressLine1());

        order.setShippingAddressLine2(
                address.getAddressLine2());

        order.setShippingCity(
                address.getCity());

        order.setShippingState(
                address.getState());

        order.setShippingPostalCode(
                address.getPostalCode());

        order.setShippingCountry(
                address.getCountry());
    }

    private OrderResponse mapToResponse(
            Order order) {

        ShippingAddressResponse shippingAddress =
                new ShippingAddressResponse(
                        order.getShippingFullName(),
                        order.getShippingPhoneNumber(),
                        order.getShippingAddressLine1(),
                        order.getShippingAddressLine2(),
                        order.getShippingCity(),
                        order.getShippingState(),
                        order.getShippingPostalCode(),
                        order.getShippingCountry()
                );

        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(this::mapItemToResponse)
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                shippingAddress,
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    private OrderItemResponse mapItemToResponse(
            OrderItem item) {

        Product product =
                item.getProduct();

        return new OrderItemResponse(
                item.getId(),
                product == null
                        ? null
                        : product.getId(),
                item.getProductName(),
                product == null
                        ? null
                        : product.getImageUrl(),
                item.getQuantity(),
                item.getPrice(),
                item.getSubtotal()
        );
    }
}