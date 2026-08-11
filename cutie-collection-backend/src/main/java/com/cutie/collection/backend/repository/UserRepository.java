package com.cutie.collection.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cutie.collection.backend.entity.Role;
import com.cutie.collection.backend.entity.User;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(
            String email);

    Optional<User> findByEmailIgnoreCaseAndActiveTrue(
            String email);

    boolean existsByEmailIgnoreCase(
            String email);

    List<User> findAllByRoleAndActiveTrueOrderByCreatedAtDesc(
            Role role);

    long countByRoleAndActiveTrue(
            Role role);
}