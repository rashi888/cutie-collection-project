package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Address;

public interface AddressRepository
        extends JpaRepository<Address, Long> {

    List<Address> findAllByUserIdAndActiveTrueOrderByDefaultAddressDescCreatedAtDesc(
            Long userId);

    Optional<Address> findByIdAndUserIdAndActiveTrue(
            Long addressId,
            Long userId);

    Optional<Address> findByUserIdAndDefaultAddressTrueAndActiveTrue(
            Long userId);

    boolean existsByIdAndUserIdAndActiveTrue(
            Long addressId,
            Long userId);

    long countByUserIdAndActiveTrue(
            Long userId);
}