package com.cutie.collection.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.CartRequest;
import com.cutie.collection.backend.dto.CartResponse;
import com.cutie.collection.backend.entity.CartItem;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.exception.BadRequestException;
import com.cutie.collection.backend.exception.InsufficientStockException;
import com.cutie.collection.backend.exception.ProductNotFoundException;
import com.cutie.collection.backend.exception.ResourceNotFoundException;
import com.cutie.collection.backend.repository.CartRepository;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;

@Service
public class CartService {

    private static final int MONEY_SCALE = 2;

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartResponse addToCart(
            Long userId,
            CartRequest request) {

        User user = findActiveUser(userId);

        Product product = productRepository
                .findByIdAndActiveTrue(
                        request.getProductId())
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                request.getProductId()));

        validateProductAvailability(
                product,
                request.getQuantity());

        CartItem cartItem = cartRepository
                .findByUserIdAndProductId(
                        userId,
                        product.getId())
                .orElse(null);

        if (cartItem != null) {

            int updatedQuantity =
                    cartItem.getQuantity()
                            + request.getQuantity();

            validateProductAvailability(
                    product,
                    updatedQuantity);

            cartItem.setQuantity(updatedQuantity);

        } else {

            cartItem = new CartItem(
                    user,
                    product,
                    request.getQuantity());
        }

        CartItem savedItem =
                cartRepository.save(cartItem);

        return mapToResponse(savedItem);
    }

    @Transactional(readOnly = true)
    public List<CartResponse> getCart(Long userId) {

        findActiveUser(userId);

        return cartRepository
                .findAllByUserIdOrderByCreatedAtDesc(
                        userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CartResponse updateQuantity(
            Long userId,
            Long cartItemId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new BadRequestException(
                    "Cart quantity must be greater than zero");
        }

        CartItem cartItem = cartRepository
                .findByIdAndUserId(
                        cartItemId,
                        userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart item not found"));

        Product product = cartItem.getProduct();

        if (!product.isActive()) {
            throw new BadRequestException(
                    "This product is no longer available");
        }

        validateProductAvailability(
                product,
                quantity);

        cartItem.setQuantity(quantity);

        return mapToResponse(
                cartRepository.save(cartItem));
    }

    @Transactional
    public void removeFromCart(
            Long userId,
            Long cartItemId) {

        CartItem cartItem = cartRepository
                .findByIdAndUserId(
                        cartItemId,
                        userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart item not found"));

        cartRepository.delete(cartItem);
    }

    @Transactional
    public void removeProductFromCart(
            Long userId,
            Long productId) {

        long deletedRows =
                cartRepository
                        .deleteByUserIdAndProductId(
                                userId,
                                productId);

        if (deletedRows == 0) {
            throw new ResourceNotFoundException(
                    "Product was not found in the cart");
        }
    }

    @Transactional
    public void clearCart(Long userId) {

        findActiveUser(userId);

        cartRepository.deleteAllByUserId(userId);
    }

    @Transactional(readOnly = true)
    public long countCartItems(Long userId) {

        return cartRepository.countByUserId(userId);
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

    private void validateProductAvailability(
            Product product,
            Integer requestedQuantity) {

        if (requestedQuantity == null
                || requestedQuantity <= 0) {

            throw new BadRequestException(
                    "Cart quantity must be greater than zero");
        }

        if (!product.isActive()) {
            throw new BadRequestException(
                    "This product is no longer available");
        }

        if (product.getStockQuantity()
                < requestedQuantity) {

            throw new InsufficientStockException(
                    product.getName(),
                    requestedQuantity,
                    product.getStockQuantity());
        }
    }

    private CartResponse mapToResponse(
            CartItem cartItem) {

        Product product = cartItem.getProduct();
        Category category = product.getCategory();

        BigDecimal subtotal =
                product.getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        cartItem.getQuantity()))
                        .setScale(
                                MONEY_SCALE,
                                RoundingMode.HALF_UP);

        return new CartResponse(
                cartItem.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                category.getId(),
                category.getName(),
                product.getPrice(),
                cartItem.getQuantity(),
                subtotal,
                product.getStockQuantity(),
                product.isActive(),
                cartItem.getCreatedAt(),
                cartItem.getUpdatedAt()
        );
    }
}