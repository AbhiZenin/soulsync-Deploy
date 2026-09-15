package com.soulsync.service;

import com.soulsync.domain.*;
import com.soulsync.domain.Enums.VerificationPurpose;
import com.soulsync.exception.BadRequestException;
import com.soulsync.repository.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.*;

@Service
@RequiredArgsConstructor
public class OtpService {
  private static final SecureRandom RNG = new SecureRandom();
  private final VerificationCodeRepository codes;
  private final PasswordEncoder encoder;

  @Value("${soulsync.otp.expiry-minutes:10}") int expiryMinutes;
  @Value("${soulsync.otp.resend-cooldown-seconds:60}") int resendCooldownSeconds;
  @Value("${soulsync.otp.max-attempts:5}") int maxAttempts;

  public record IssuedCode(String code, Instant expiresAt, long retryAfterSeconds) {}

  @Transactional
  public IssuedCode issue(User user, VerificationPurpose purpose, String target) {
    Instant now = Instant.now();
    var latest = codes.findTopByUserIdAndPurposeOrderByCreatedAtDesc(user.getId(), purpose);
    if (latest.isPresent() && latest.get().getResendAvailableAt().isAfter(now)) {
      long seconds = Math.max(1, Duration.between(now, latest.get().getResendAvailableAt()).getSeconds());
      throw new BadRequestException("Please wait " + seconds + " seconds before requesting another code");
    }

    codes.invalidateActive(user.getId(), purpose);
    String code = "%06d".formatted(RNG.nextInt(1_000_000));
    Instant expiresAt = now.plusSeconds(expiryMinutes * 60L);
    codes.save(VerificationCode.builder()
        .user(user)
        .purpose(purpose)
        .target(target)
        .codeHash(encoder.encode(code))
        .expiresAt(expiresAt)
        .resendAvailableAt(now.plusSeconds(resendCooldownSeconds))
        .maxAttempts(maxAttempts)
        .build());
    return new IssuedCode(code, expiresAt, resendCooldownSeconds);
  }

  @Transactional
  public String verify(User user, VerificationPurpose purpose, String code) {
    if (code == null || !code.matches("\\d{6}")) throw new BadRequestException("Enter a valid 6-digit verification code");
    var entry = codes.findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(user.getId(), purpose)
        .orElseThrow(() -> new BadRequestException("No active verification code. Request a new code."));

    if (entry.getExpiresAt().isBefore(Instant.now())) {
      entry.setUsed(true);
      throw new BadRequestException("Verification code expired. Request a new code.");
    }
    if (entry.getAttempts() >= entry.getMaxAttempts()) {
      entry.setUsed(true);
      throw new BadRequestException("Too many incorrect attempts. Request a new code.");
    }

    entry.setAttempts(entry.getAttempts() + 1);
    if (!encoder.matches(code, entry.getCodeHash())) {
      if (entry.getAttempts() >= entry.getMaxAttempts()) {
        entry.setUsed(true);
        throw new BadRequestException("Too many incorrect attempts. Request a new code.");
      }
      int remaining = entry.getMaxAttempts() - entry.getAttempts();
      throw new BadRequestException("Incorrect verification code. " + remaining + " attempt" + (remaining == 1 ? "" : "s") + " remaining.");
    }

    entry.setUsed(true);
    return entry.getTarget();
  }

  public int expiryMinutes(){ return expiryMinutes; }
}
