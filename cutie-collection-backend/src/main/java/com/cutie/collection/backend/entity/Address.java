package com.cutie.collection.backend.entity;


import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false)
    private User user;

    @Column(
            name = "full_name",
            nullable = false,
            length = 100)
    private String fullName;

    @Column(
            name = "phone_number",
            nullable = false,
            length = 20)
    private String phoneNumber;

    @Column(
            name = "address_line_1",
            nullable = false,
            length = 255)
    private String addressLine1;

    @Column(
            name = "address_line_2",
            length = 255)
    private String addressLine2;

    @Column(
            nullable = false,
            length = 100)
    private String city;

    @Column(
            nullable = false,
            length = 100)
    private String state;

    @Column(
            name = "postal_code",
            nullable = false,
            length = 20)
    private String postalCode;

    @Column(
            nullable = false,
            length = 100)
    private String country;

    @Column(
            name = "default_address",
            nullable = false)
    private boolean defaultAddress;

    @Column(
            name = "active",
            nullable = false)
    private boolean active = true;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    protected Address() {
    }

    public Address(
            User user,
            String fullName,
            String phoneNumber,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String postalCode,
            String country) {

        setUser(user);
        setFullName(fullName);
        setPhoneNumber(phoneNumber);
        setAddressLine1(addressLine1);
        setAddressLine2(addressLine2);
        setCity(city);
        setState(state);
        setPostalCode(postalCode);
        setCountry(country);

        this.defaultAddress = false;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {

        validateState();

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        validateState();

        updatedAt = LocalDateTime.now();
    }

    private void validateState() {

        if (user == null) {
            throw new IllegalStateException(
                    "Address user cannot be null");
        }

        validateRequiredValue(
                fullName,
                "Full name");

        validateRequiredValue(
                phoneNumber,
                "Phone number");

        validateRequiredValue(
                addressLine1,
                "Address line 1");

        validateRequiredValue(
                city,
                "City");

        validateRequiredValue(
                state,
                "State");

        validateRequiredValue(
                postalCode,
                "Postal code");

        validateRequiredValue(
                country,
                "Country");
    }

    private void validateRequiredValue(
            String value,
            String fieldName) {

        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    fieldName + " cannot be blank");
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getCountry() {
        return country;
    }

    public boolean isDefaultAddress() {
        return defaultAddress;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "Address user cannot be null");
        }

        this.user = user;
    }

    public void setFullName(String fullName) {

        this.fullName = normalizeRequired(
                fullName,
                "Full name",
                100);
    }

    public void setPhoneNumber(String phoneNumber) {

        String normalizedPhoneNumber = normalizeRequired(
                phoneNumber,
                "Phone number",
                20);

        if (!normalizedPhoneNumber.matches("[0-9+()\\- ]{7,20}")) {
            throw new IllegalArgumentException(
                    "Phone number format is invalid");
        }

        this.phoneNumber = normalizedPhoneNumber;
    }

    public void setAddressLine1(String addressLine1) {

        this.addressLine1 = normalizeRequired(
                addressLine1,
                "Address line 1",
                255);
    }

    public void setAddressLine2(String addressLine2) {

        this.addressLine2 = normalizeOptional(
                addressLine2,
                "Address line 2",
                255);
    }

    public void setCity(String city) {

        this.city = normalizeRequired(
                city,
                "City",
                100);
    }

    public void setState(String state) {

        this.state = normalizeRequired(
                state,
                "State",
                100);
    }

    public void setPostalCode(String postalCode) {

        String normalizedPostalCode = normalizeRequired(
                postalCode,
                "Postal code",
                20);

        if (!normalizedPostalCode.matches("[A-Za-z0-9\\- ]{3,20}")) {
            throw new IllegalArgumentException(
                    "Postal code format is invalid");
        }

        this.postalCode = normalizedPostalCode;
    }

    public void setCountry(String country) {

        this.country = normalizeRequired(
                country,
                "Country",
                100);
    }

    public void setDefaultAddress(boolean defaultAddress) {
        this.defaultAddress = defaultAddress;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void markAsDefault() {
        this.defaultAddress = true;
    }

    public void removeDefaultStatus() {
        this.defaultAddress = false;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {

        this.active = false;
        this.defaultAddress = false;
    }

    private String normalizeRequired(
            String value,
            String fieldName,
            int maximumLength) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be blank");
        }

        String normalizedValue = value.trim();

        if (normalizedValue.length() > maximumLength) {
            throw new IllegalArgumentException(
                    fieldName
                            + " cannot exceed "
                            + maximumLength
                            + " characters");
        }

        return normalizedValue;
    }

    private String normalizeOptional(
            String value,
            String fieldName,
            int maximumLength) {

        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();

        if (normalizedValue.length() > maximumLength) {
            throw new IllegalArgumentException(
                    fieldName
                            + " cannot exceed "
                            + maximumLength
                            + " characters");
        }

        return normalizedValue.isEmpty()
                ? null
                : normalizedValue;
    }
}