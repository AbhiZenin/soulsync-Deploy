package com.soulsync.service;

import com.soulsync.exception.*;
import com.soulsync.repository.*;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountService {

  private final CurrentUser current;
  private final UserRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder encoder;

  @Transactional
  public void changePassword(String currentPassword, String newPassword) {
    var u = current.entity();

    if (!encoder.matches(currentPassword, u.getPasswordHash())) {
      throw new BadRequestException("Current password is incorrect");
    }

    u.setPasswordHash(encoder.encode(newPassword));
    refreshTokens.revokeAllForUser(u.getId());
  }

  @Transactional
  public void delete(String password) {
    var u = current.entity();

    if (!encoder.matches(password, u.getPasswordHash())) {
      throw new BadRequestException("Password is incorrect");
    }

    users.delete(u);
  }
}