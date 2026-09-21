package com.soulsync.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MailService {

    @Value("${soulsync.mail-enabled}")
    boolean enabled;

    @Value("${soulsync.frontend-url}")
    String frontend;

    @Value("${soulsync.mail-from:no-reply@soulsync.local}")
    String from;

    @Value("${RESEND_API_KEY:}")
    String resendApiKey;

    private final RestClient.Builder restClientBuilder;

    public void verificationCode(String email, String code, int expiryMinutes) {
        if (!enabled) return;

        String text =
                "Your SoulSync verification code is " + code + ".\n\n" +
                "It expires in " + expiryMinutes + " minutes. " +
                "Do not share this code with anyone.\n\n" +
                "If you did not create a SoulSync account, you can ignore this email.";

        send(
                email,
                "Your SoulSync verification code",
                text
        );
    }

    public void passwordReset(String email, String token) {
        if (!enabled) return;

        String resetUrl =
                frontend.replaceAll("/+$", "") +
                "/reset-password?token=" + token;

        send(
                email,
                "Reset your SoulSync password",
                "Reset your password: " + resetUrl
        );
    }

    private void send(String to, String subject, String text) {

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is not configured");
        }

        RestClient client = restClientBuilder
                .baseUrl("https://api.resend.com")
                .defaultHeader(
                        "Authorization",
                        "Bearer " + resendApiKey
                )
                .build();

        client.post()
                .uri("/emails")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", from,
                        "to", new String[]{to},
                        "subject", subject,
                        "text", text
                ))
                .retrieve()
                .toBodilessEntity();
    }
}