package com.cutie.collection.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${application.frontend-url}") String frontendUrl) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())

                /*
                 * This backend uses stateless JWT authentication instead of
                 * browser session authentication.
                 */
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(authorize -> authorize

                        /*
                         * Allow browser CORS preflight requests.
                         */
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        /*
                         * Registration and login are public.
                         */
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        /*
                         * Public product browsing.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**")
                        .permitAll()

                        /*
                         * Public category browsing.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories/**")
                        .permitAll()

                        /*
                         * Public review viewing.
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/reviews/**")
                        .permitAll()

                        /*
                         * Every administrator endpoint requires ADMIN.
                         * Place this rule before general authenticated rules.
                         */
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        /*
                         * Support existing category-management routes until
                         * they are moved under /api/admin/categories.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/categories/**")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/categories/**")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/categories/**")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/categories/**")
                        .hasRole("ADMIN")

                        /*
                         * Creating a review requires an authenticated user.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/reviews/**")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/reviews/**")
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/reviews/**")
                        .authenticated()

                        /*
                         * Customer-specific APIs.
                         */
                        .requestMatchers("/api/users/**")
                        .authenticated()

                        .requestMatchers("/api/user/**")
                        .authenticated()

                        .requestMatchers("/api/cart/**")
                        .authenticated()

                        .requestMatchers("/api/wishlist/**")
                        .authenticated()

                        .requestMatchers("/api/addresses/**")
                        .authenticated()

                        .requestMatchers("/api/orders/**")
                        .authenticated()

                        /*
                         * Payment creation and payment verification require
                         * an authenticated customer.
                         */
                        .requestMatchers("/api/payments/**")
                        .authenticated()

                        /*
                         * All other endpoints are protected by default.
                         */
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(frontendUrl));

        configuration.setAllowedMethods(
                List.of(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PUT.name(),
                        HttpMethod.PATCH.name(),
                        HttpMethod.DELETE.name(),
                        HttpMethod.OPTIONS.name()
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT
                )
        );

        /*
         * Authorization headers are permitted. The frontend currently uses
         * bearer-token authentication rather than session cookies.
         */
        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}