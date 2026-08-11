package com.cutie.collection.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cutie.collection.backend.dto.AddressRequest;
import com.cutie.collection.backend.dto.AddressResponse;
import com.cutie.collection.backend.entity.Address;
import com.cutie.collection.backend.entity.User;
import com.cutie.collection.backend.exception.ResourceNotFoundException;
import com.cutie.collection.backend.repository.AddressRepository;
import com.cutie.collection.backend.repository.UserRepository;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new address for the authenticated customer.
     *
     * The first active address is automatically set as the default address.
     * When defaultAddress is true, the previous default address is removed.
     */
    @Transactional
    public AddressResponse createAddress(
            Long userId,
            AddressRequest request) {

        User user = findActiveUser(userId);

        Address address = new Address(
                user,
                request.getFullName(),
                request.getPhoneNumber(),
                request.getAddressLine1(),
                request.getAddressLine2(),
                request.getCity(),
                request.getState(),
                request.getPostalCode(),
                request.getCountry()
        );

        long activeAddressCount =
                addressRepository.countByUserIdAndActiveTrue(userId);

        boolean shouldBeDefault =
                activeAddressCount == 0
                        || request.isDefaultAddress();

        if (shouldBeDefault) {
            removeCurrentDefaultAddress(userId);
            address.markAsDefault();
        }

        Address savedAddress =
                addressRepository.save(address);

        return mapToResponse(savedAddress);
    }

    /**
     * Returns all active addresses belonging to the authenticated customer.
     *
     * The default address appears first.
     */
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(
            Long userId) {

        findActiveUser(userId);

        return addressRepository
                .findAllByUserIdAndActiveTrueOrderByDefaultAddressDescCreatedAtDesc(
                        userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Returns one active address owned by the authenticated customer.
     */
    @Transactional(readOnly = true)
    public AddressResponse getMyAddressById(
            Long userId,
            Long addressId) {

        Address address =
                findOwnedActiveAddress(
                        userId,
                        addressId);

        return mapToResponse(address);
    }

    /**
     * Returns the authenticated customer's default active address.
     */
    @Transactional(readOnly = true)
    public AddressResponse getDefaultAddress(
            Long userId) {

        findActiveUser(userId);

        Address address = addressRepository
                .findByUserIdAndDefaultAddressTrueAndActiveTrue(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Default address not found"));

        return mapToResponse(address);
    }

    /**
     * Updates an active address owned by the authenticated customer.
     */
    @Transactional
    public AddressResponse updateAddress(
            Long userId,
            Long addressId,
            AddressRequest request) {

        Address address =
                findOwnedActiveAddress(
                        userId,
                        addressId);

        address.setFullName(
                request.getFullName());

        address.setPhoneNumber(
                request.getPhoneNumber());

        address.setAddressLine1(
                request.getAddressLine1());

        address.setAddressLine2(
                request.getAddressLine2());

        address.setCity(
                request.getCity());

        address.setState(
                request.getState());

        address.setPostalCode(
                request.getPostalCode());

        address.setCountry(
                request.getCountry());

        if (request.isDefaultAddress()
                && !address.isDefaultAddress()) {

            removeCurrentDefaultAddress(userId);
            address.markAsDefault();
        }

        Address savedAddress =
                addressRepository.save(address);

        return mapToResponse(savedAddress);
    }

    /**
     * Makes the selected address the customer's default address.
     */
    @Transactional
    public AddressResponse setDefaultAddress(
            Long userId,
            Long addressId) {

        Address selectedAddress =
                findOwnedActiveAddress(
                        userId,
                        addressId);

        if (selectedAddress.isDefaultAddress()) {
            return mapToResponse(selectedAddress);
        }

        removeCurrentDefaultAddress(userId);

        selectedAddress.markAsDefault();

        Address savedAddress =
                addressRepository.save(selectedAddress);

        return mapToResponse(savedAddress);
    }

    /**
     * Soft-deletes an address.
     *
     * If the deleted address was the default address, another active
     * address is automatically selected as the new default.
     */
    @Transactional
    public void deleteAddress(
            Long userId,
            Long addressId) {

        Address address =
                findOwnedActiveAddress(
                        userId,
                        addressId);

        boolean wasDefault =
                address.isDefaultAddress();

        address.deactivate();

        addressRepository.save(address);

        if (wasDefault) {
            assignAnotherDefaultAddress(userId);
        }
    }

    /**
     * Returns the number of active addresses owned by the customer.
     */
    @Transactional(readOnly = true)
    public long countMyAddresses(Long userId) {

        findActiveUser(userId);

        return addressRepository
                .countByUserIdAndActiveTrue(userId);
    }

    /**
     * Finds an active user.
     */
    private User findActiveUser(Long userId) {

        return userRepository
                .findById(userId)
                .filter(User::isActive)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User",
                                userId));
    }

    /**
     * Finds an active address and verifies that it belongs to the customer.
     */
    private Address findOwnedActiveAddress(
            Long userId,
            Long addressId) {

        return addressRepository
                .findByIdAndUserIdAndActiveTrue(
                        addressId,
                        userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Address not found"));
    }

    /**
     * Removes the default designation from the current default address.
     */
    private void removeCurrentDefaultAddress(
            Long userId) {

        addressRepository
                .findByUserIdAndDefaultAddressTrueAndActiveTrue(userId)
                .ifPresent(currentDefault -> {

                    currentDefault.removeDefaultStatus();

                    addressRepository.save(currentDefault);
                });
    }

    /**
     * Assigns another active address as default after deleting the previous
     * default address.
     */
    private void assignAnotherDefaultAddress(
            Long userId) {

        List<Address> remainingAddresses =
                addressRepository
                        .findAllByUserIdAndActiveTrueOrderByDefaultAddressDescCreatedAtDesc(
                                userId);

        if (remainingAddresses.isEmpty()) {
            return;
        }

        Address newDefault =
                remainingAddresses.get(0);

        newDefault.markAsDefault();

        addressRepository.save(newDefault);
    }

    /**
     * Converts the Address entity into a safe response DTO.
     */
    private AddressResponse mapToResponse(
            Address address) {

        return new AddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhoneNumber(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.isDefaultAddress(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}