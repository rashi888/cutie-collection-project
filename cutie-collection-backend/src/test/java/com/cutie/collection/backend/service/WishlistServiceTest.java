package com.cutie.collection.backend.service;

import com.cutie.collection.backend.dto.WishlistResponse;
import com.cutie.collection.backend.entity.Category;
import com.cutie.collection.backend.entity.Product;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.entity.WishlistItem;
import com.cutie.collection.backend.repository.ProductRepository;
import com.cutie.collection.backend.repository.UserRepository;
import com.cutie.collection.backend.repository.WishlistRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock WishlistRepository wishlistRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;

    @InjectMocks WishlistService wishlistService;

    private User user;
    private Product product;

    @BeforeEach
    void setUpSecurityContext() {
        // Populate SecurityContextHolder — WishlistService reads it directly
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("test@example.com", null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        user = new User("Test User", "test@example.com", "hashed");
        user.setId(1L);

        Category category = new Category();
        category.setName("Plushies");

        product = new Product();
        product.setId(10L);
        product.setName("Cute Bear");
        product.setPrice(new BigDecimal("19.99"));
        product.setImageUrl("http://img.test/bear.png");
        product.setStockQuantity(50);
        product.setCategory(category);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addToWishlist_newItem_savesItem() {
        when(wishlistRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(false);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        wishlistService.addToWishlist(10L);

        verify(wishlistRepository).save(any(WishlistItem.class));
    }

    @Test
    void addToWishlist_alreadyExists_doesNotSave() {
        when(wishlistRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(true);

        wishlistService.addToWishlist(10L);

        verify(wishlistRepository, never()).save(any());
    }

    @Test
    void getWishlist_returnsMappedList() {
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);

        when(wishlistRepository.findByUserId(1L)).thenReturn(List.of(item));

        List<WishlistResponse> result = wishlistService.getWishlist();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductName()).isEqualTo("Cute Bear");
        assertThat(result.get(0).getPrice()).isEqualByComparingTo("19.99");
    }

    @Test
    void removeFromWishlist_callsDeleteByUserIdAndProductId() {
        wishlistService.removeFromWishlist(10L);
        verify(wishlistRepository).deleteByUserIdAndProductId(1L, 10L);
    }

    @Test
    void clearWishlist_callsDeleteByUserId() {
        wishlistService.clearWishlist();
        verify(wishlistRepository).deleteByUserId(1L);
    }
}