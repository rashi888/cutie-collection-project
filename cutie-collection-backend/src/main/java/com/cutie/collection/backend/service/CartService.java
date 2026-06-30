package com.cutie.collection.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.cutie.collection.backend.dto.CartRequest;
import com.cutie.collection.backend.dto.CartResponse;
import com.cutie.collection.backend.entity.CartItem;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.CartRepository;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;

@Service
public class CartService {

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

    public CartResponse addToCart(
            Long userId,
            CartRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        CartItem existingItem =
                cartRepository
                        .findByUserIdAndProductId(
                                userId,
                                request.getProductId())
                        .orElse(null);

        if (existingItem != null) {

            existingItem.setQuantity(
                    existingItem.getQuantity()
                            + request.getQuantity());

            return mapToResponse(
                    cartRepository.save(existingItem));
        }

        CartItem cartItem = new CartItem();

        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(request.getQuantity());

        return mapToResponse(
                cartRepository.save(cartItem));
    }

    public List<CartResponse> getCart(Long userId) {

        return cartRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CartResponse updateQuantity(
            Long cartItemId,
            Integer quantity) {

        CartItem cartItem =
                cartRepository.findById(cartItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart item not found"));

        cartItem.setQuantity(quantity);

        return mapToResponse(
                cartRepository.save(cartItem));
    }

    public void removeFromCart(Long cartItemId) {

        cartRepository.deleteById(cartItemId);
    }

    public void clearCart(Long userId) {

        List<CartItem> items =
                cartRepository.findByUserId(userId);

        cartRepository.deleteAll(items);
    }

    private CartResponse mapToResponse(
            CartItem cartItem) {

        CartResponse response =
                new CartResponse();

        response.setId(cartItem.getId());

        response.setProductId(
                cartItem.getProduct().getId());

        response.setProductName(
                cartItem.getProduct().getName());

        response.setImageUrl(
                cartItem.getProduct().getImageUrl());

        response.setCategoryName(
                cartItem.getProduct()
                        .getCategory()
                        .getName());

        response.setPrice(
                cartItem.getProduct().getPrice());

        response.setQuantity(
                cartItem.getQuantity());

        response.setSubtotal(
                cartItem.getProduct()
                        .getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        cartItem.getQuantity())));

        return response;
    }
}