package com.cutie.collection.backend.util;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

            @Component
            public class JwtUtil {

    private static final long EXPIRATION =
            1000 * 60 * 60 * 24; // 24 Hours

    private static final String SECRET =
            "cutiecollectionsecretkeycutiecollectionsecretkey";

    private final SecretKey key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes());

    /**
     * Generate JWT Token
     */
    public String generateToken(String email) {

        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION))
                .signWith(key)
                .compact();
    }

    /**
     * Extract Username (Email)
     */
    public String extractUsername(
            String token) {

        return extractClaims(token)
                .getSubject();
    }

    /**
     * Validate JWT Token
     */
    public boolean validateToken(
            String token) {

        try {

            extractClaims(token);

            return !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }

    /**
     * Validate Token Against Username
     */
    public boolean validateToken(
            String token,
            String username) {

        String extractedUsername =
                extractUsername(token);

        return extractedUsername
                .equals(username)
                && !isTokenExpired(token);
    }

    /**
     * Check Token Expiry
     */
    public boolean isTokenExpired(
            String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    /**
     * Extract Expiration Date
     */
    public Date extractExpiration(
            String token) {

        return extractClaims(token)
                .getExpiration();
    }

    /**
     * Extract Claims
     */
    private Claims extractClaims(
            String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
