package com.soulsync.config;

import com.soulsync.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final RateLimitFilter rateLimitFilter;

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${soulsync.frontend-url}") String frontend,
            @Value("${soulsync.dev-mode}") boolean devMode) {

        CorsConfiguration config = new CorsConfiguration();

        // Remove spaces and trailing slash from production frontend URL
        String normalizedFrontend = frontend
                .trim()
                .replaceAll("/+$", "");

        List<String> origins = new ArrayList<>();

        origins.add(normalizedFrontend);

        // Only allow localhost origins while running in dev mode
        if (devMode) {
            origins.add("http://localhost:3000");
            origins.add("http://127.0.0.1:3000");
        }

        config.setAllowedOrigins(
                origins.stream()
                        .distinct()
                        .toList()
        );

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Type"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    SecurityFilterChain chain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        return http

                .csrf(csrf ->
                        csrf.disable()
                )

                // Explicitly use our CORS configuration
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource)
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Allow browser CORS preflight requests
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        // Public authentication endpoints
                        .requestMatchers(
                                "/api/v1/auth/**"
                        )
                        .permitAll()

                        // Stripe/subscription webhook
                        .requestMatchers(
                                "/api/v1/subscriptions/webhook"
                        )
                        .permitAll()

                        // Health endpoint
                        .requestMatchers(
                                "/actuator/health/**"
                        )
                        .permitAll()

                        // WebSocket handshake
                        .requestMatchers(
                                "/ws/**"
                        )
                        .permitAll()

                        // Public API endpoints
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/v1/public/**"
                        )
                        .permitAll()

                        // Admin endpoints
                        .requestMatchers(
                                "/api/v1/admin/**"
                        )
                        .hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        rateLimitFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}