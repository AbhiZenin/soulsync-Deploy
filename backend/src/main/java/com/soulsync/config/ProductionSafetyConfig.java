package com.soulsync.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class ProductionSafetyConfig implements ApplicationRunner {

  private final Environment environment;

  @Value("${soulsync.dev-mode}")
  boolean devMode;

  @Value("${soulsync.seed-demo}")
  boolean seedDemo;

  @Value("${soulsync.jwt.secret}")
  String jwtSecret;

  @Value("${soulsync.frontend-url}")
  String frontendUrl;

  @Value("${soulsync.mail-enabled}")
  boolean mailEnabled;

  @Override
  public void run(ApplicationArguments args) {

    if (devMode) {
      return;
    }

    if (seedDemo) {
      throw new IllegalStateException(
          "SEED_DEMO must be false when DEV_MODE=false"
      );
    }

    if (jwtSecret == null
        || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32
        || jwtSecret.contains("change-me")
        || jwtSecret.contains("dev-only")
        || jwtSecret.contains("replace-with")) {

      throw new IllegalStateException(
          "Production requires a unique JWT_SECRET of at least 32 bytes"
      );
    }

    if (frontendUrl == null || !frontendUrl.startsWith("https://")) {
      throw new IllegalStateException(
          "Production FRONTEND_URL must use HTTPS"
      );
    }

    String databasePassword =
        environment.getProperty("DATABASE_PASSWORD", "");

    if (databasePassword.isBlank()
        || "soulsync_dev".equals(databasePassword)) {

      throw new IllegalStateException(
          "Production requires a non-default DATABASE_PASSWORD"
      );
    }

    if (!mailEnabled) {
      throw new IllegalStateException(
          "MAIL_ENABLED must be true in production so email verification can be delivered"
      );
    }
  }
}