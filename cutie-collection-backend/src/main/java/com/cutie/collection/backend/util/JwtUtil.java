package com.cutie.collection.backend.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private static final int MINIMUM_SECRET_LENGTH = 32;

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${application.jwt.secret}") String secret,
            @Value("${application.jwt.expiration-ms}") long expirationMs) {

        validateConfiguration(secret, expirationMs);

        this.signingKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8));

        this.expirationMs = expirationMs;
    }

    /**
     * Generates a signed JWT for the authenticated user's email.
     *
     * @param email authenticated user's email
     * @return signed JWT
     */
    public String generateToken(String email) {

        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException(
                    "Email cannot be blank when generating a token");
        }

        Date issuedAt = new Date();
        Date expiresAt = new Date(issuedAt.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extracts the username, which is the user's email, from the token.
     *
     * @param token signed JWT
     * @return email stored in the token subject
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Validates the token signature, structure, and expiration.
     *
     * @param token signed JWT
     * @return true when the token is valid
     */
    public boolean validateToken(String token) {

        if (!StringUtils.hasText(token)) {
            return false;
        }

        try {
            Claims claims = extractAllClaims(token);
            return !isExpired(claims);

        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    /**
     * Validates the token and confirms that it belongs to the supplied
     * username.
     *
     * @param token signed JWT
     * @param username expected email or username
     * @return true when the token is valid and belongs to the user
     */
    public boolean validateToken(
            String token,
            String username) {

        if (!StringUtils.hasText(token)
                || !StringUtils.hasText(username)) {
            return false;
        }

        try {
            Claims claims = extractAllClaims(token);
            String tokenUsername = claims.getSubject();

            return username.equals(tokenUsername)
                    && !isExpired(claims);

        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    /**
     * Checks whether the token has expired.
     *
     * @param token signed JWT
     * @return true when the expiration time has passed
     */
    public boolean isTokenExpired(String token) {

        try {
            Claims claims = extractAllClaims(token);
            return isExpired(claims);

        } catch (JwtException | IllegalArgumentException exception) {
            return true;
        }
    }

    /**
     * Returns the expiration date stored in the token.
     *
     * @param token signed JWT
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    /**
     * Verifies the signature and extracts all JWT claims.
     */
    private Claims extractAllClaims(String token) {

        if (!StringUtils.hasText(token)) {
            throw new IllegalArgumentException(
                    "JWT cannot be blank");
        }

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Checks expiration using already parsed claims.
     */
    private boolean isExpired(Claims claims) {

        Date expiration = claims.getExpiration();

        return expiration == null
                || expiration.before(new Date());
    }

    /**
     * Fails application startup when JWT configuration is unsafe.
     */
    private void validateConfiguration(
            String secret,
            long expirationMs) {

        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException(
                    "JWT secret is not configured");
        }

        if (secret.getBytes(StandardCharsets.UTF_8).length
                < MINIMUM_SECRET_LENGTH) {

            throw new IllegalStateException(
                    "JWT secret must contain at least 32 UTF-8 bytes");
        }

        if (expirationMs <= 0) {
            throw new IllegalStateException(
                    "JWT expiration must be greater than zero");
        }
    }
}