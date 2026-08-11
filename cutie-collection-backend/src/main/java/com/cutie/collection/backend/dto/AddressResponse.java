package com.cutie.collection.backend.dto;

import java.time.LocalDateTime;

public record AddressResponse(
        Long id,
        String fullName,
        String phoneNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        boolean defaultAddress,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}