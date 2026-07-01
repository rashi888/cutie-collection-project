package com.cutie.collection.backend.service;

import com.cutie.collection.backend.dto.CartRequest;
import com.cutie.collection.backend.dto.CartResponse;
import com.cutie.collection.backend.entity.CartItem;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.repository.CartRepository;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock CartRepository cartRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;

    @InjectMocks CartService cartService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = new User("Rashi", "rashi@example.com", "hashed");
        user.setId(1L);

        Category category = new Category();
        category.setName("Plushies");

        product = new Product();
        product.setId(10L);
        product.setName("Cute Bear");
        product.setPrice(new BigDecimal("19.99"));
        product.setImageUrl("http://img.test/bear.png");
        product.setCategory(category);
    }

    @Test
    void addToCart_newItem_savesNewCartItem() {
        CartRequest req = new CartRequest();
        req.setProductId(10L);
        req.setQuantity(2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserIdAndProductId(1L, 10L)).thenReturn(Optional.empty());

        CartItem saved = new CartItem();
        saved.setId(100L);
        saved.setUser(user);
        saved.setProduct(product);
        saved.setQuantity(2);
        when(cartRepository.save(any(CartItem.class))).thenReturn(saved);

        CartResponse response = cartService.addToCart(1L, req);

        assertThat(response.getProductId()).isEqualTo(10L);
        assertThat(response.getQuantity()).isEqualTo(2);
        verify(cartRepository).save(any(CartItem.class));
    }

    @Test
    void addToCart_existingItem_updatesQuantity() {
        CartRequest req = new CartRequest();
        req.setProductId(10L);
        req.setQuantity(3);

        CartItem existing = new CartItem();
        existing.setId(100L);
        existing.setUser(user);
        existing.setProduct(product);
        existing.setQuantity(2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserIdAndProductId(1L, 10L)).thenReturn(Optional.of(existing));

        CartItem updated = new CartItem();
        updated.setId(100L);
        updated.setUser(user);
        updated.setProduct(product);
        updated.setQuantity(5);
        when(cartRepository.save(existing)).thenReturn(updated);

        CartResponse response = cartService.addToCart(1L, req);

        assertThat(response.getQuantity()).isEqualTo(5);
        verify(cartRepository).save(existing);
    }

    @Test
    void getCart_returnsListOfCartResponses() {
        CartItem item = new CartItem();
        item.setId(1L);
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(1);

        when(cartRepository.findByUserId(1L)).thenReturn(List.of(item));

        List<CartResponse> result = cartService.getCart(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductName()).isEqualTo("Cute Bear");
    }

    @Test
    void updateQuantity_updatesCartItem() {
        CartItem item = new CartItem();
        item.setId(5L);
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(1);

        when(cartRepository.findById(5L)).thenReturn(Optional.of(item));
        when(cartRepository.save(item)).thenReturn(item);

        item.setQuantity(4);
        CartResponse response = cartService.updateQuantity(5L, 4);

        assertThat(response.getQuantity()).isEqualTo(4);
        verify(cartRepository).save(item);
    }

    @Test
    void removeFromCart_deletesById() {
        cartService.removeFromCart(7L);
        verify(cartRepository).deleteById(7L);
    }

    @Test
    void clearCart_deletesAllUserItems() {
        CartItem item = new CartItem();
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(1);

        when(cartRepository.findByUserId(1L)).thenReturn(List.of(item));

        cartService.clearCart(1L);

        verify(cartRepository).deleteAll(List.of(item));
    }

    @Test
    void addToCart_userNotFound_throwsException() {
        CartRequest req = new CartRequest();
        req.setProductId(10L);
        req.setQuantity(1);

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.addToCart(99L, req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    void addToCart_productNotFound_throwsException() {
        CartRequest req = new CartRequest();
        req.setProductId(999L);
        req.setQuantity(1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cartService.addToCart(1L, req))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found");
    }
}