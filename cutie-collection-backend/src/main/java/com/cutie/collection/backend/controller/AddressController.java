package com.cutie.collection.backend.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cutie.collection.backend.dto.AddressRequest;
import com.cutie.collection.backend.dto.AddressResponse;
import com.cutie.collection.backend.service.AddressService;
import com.cutie.collection.backend.service.CurrentUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;
    private final CurrentUserService currentUserService;

    public AddressController(
            AddressService addressService,
            CurrentUserService currentUserService) {

        this.addressService = addressService;
        this.currentUserService = currentUserService;
    }

    /**
     * Creates a new address for the authenticated customer.
     */
    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        AddressResponse response =
                addressService.createAddress(
                        userId,
                        request);

        URI location = URI.create(
                "/api/addresses/" + response.id());

        return ResponseEntity
                .created(location)
                .body(response);
    }

    /**
     * Returns all active addresses owned by the authenticated customer.
     */
    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses(
            Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                addressService.getMyAddresses(userId));
    }

    /**
     * Returns the number of active customer addresses.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countMyAddresses(
            Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        long count =
                addressService.countMyAddresses(userId);

        return ResponseEntity.ok(
                Map.of("count", count));
    }

    /**
     * Returns the customer's default active address.
     */
    @GetMapping("/default")
    public ResponseEntity<AddressResponse> getDefaultAddress(
            Authentication authentication) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                addressService.getDefaultAddress(userId));
    }

    /**
     * Returns one active customer-owned address.
     */
    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponse> getAddressById(
            Authentication authentication,
            @PathVariable Long addressId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                addressService.getMyAddressById(
                        userId,
                        addressId));
    }

    /**
     * Updates a customer-owned address.
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            Authentication authentication,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                addressService.updateAddress(
                        userId,
                        addressId,
                        request));
    }

    /**
     * Sets a customer-owned address as the default address.
     */
    @PatchMapping("/{addressId}/default")
    public ResponseEntity<AddressResponse> setDefaultAddress(
            Authentication authentication,
            @PathVariable Long addressId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        return ResponseEntity.ok(
                addressService.setDefaultAddress(
                        userId,
                        addressId));
    }

    /**
     * Soft-deletes a customer-owned address.
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            Authentication authentication,
            @PathVariable Long addressId) {

        Long userId =
                currentUserService.getCurrentUserId(
                        authentication);

        addressService.deleteAddress(
                userId,
                addressId);

        return ResponseEntity
                .noContent()
                .build();
    }
}