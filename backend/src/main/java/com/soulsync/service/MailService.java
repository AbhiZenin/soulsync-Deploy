package com.soulsync.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MailService {

    @Value("${soulsync.mail-enabled}")
    boolean enabled;

    @Value("${soulsync.frontend-url}")
    String frontend;

    @Value("${soulsync.mail-from}")
    String from;

    @Value("${BREVO_API_KEY:}")
    String brevoApiKey;

    private final RestClient.Builder restClientBuilder;

    public void verificationCode(
            String email,
            String code,
            int expiryMinutes
    ) {
        if (!enabled) return;

        String text =
                "Your SoulSync verification code is " + code + ".\n\n" +
                "It expires in " + expiryMinutes + " minutes.\n\n" +
                "Do not share this code with anyone.\n\n" +
                "If you did not create a SoulSync account, ignore this email.";

        send(
                email,
                "Your SoulSync verification code",
                text
        );
    }

    public void passwordReset(
            String email,
            String token
    ) {
        if (!enabled) return;

        String resetUrl =
                frontend.replaceAll("/+$", "") +
                "/reset-password?token=" + token;

        send(
                email,
                "Reset your SoulSync password",
                "Reset your password here:\n\n" + resetUrl
        );
    }

    private void send(
            String to,
            String subject,
            String text
    ) {

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException(
                    "BREVO_API_KEY is not configured"
            );
        }

        RestClient client = restClientBuilder
                .baseUrl("https://api.brevo.com")
                .defaultHeader(
                        "api-key",
                        brevoApiKey
                )
                .build();

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "name", "SoulSync",
                        "email", from
                ),
                "to", List.of(
                        Map.of("email", to)
                ),
                "subject", subject,
                "textContent", text
        );

        client.post()
                .uri("/v3/smtp/email")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }
}