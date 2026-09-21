package com.soulsync.service;

import com.soulsync.domain.Profile;
import com.soulsync.exception.NotFoundException;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class PremiumPlusService {
  private final ProfileRepository profiles;
  private final CurrentUser current;
  private final SubscriptionAccessService subscriptionAccess;

  public record BoostStatus(boolean active, Instant boostedUntil) {}

  @Transactional(readOnly = true)
  public BoostStatus boostStatus() {
    Profile p = profile();
    Instant until = p.getBoostedUntil();
    return new BoostStatus(until != null && until.isAfter(Instant.now()), until);
  }

  @Transactional
  public BoostStatus activateBoost() {
    subscriptionAccess.require(
        "PROFILE_BOOST",
        "Profile boost is available on Premium Plus."
    );

    Profile p = profile();
    Instant now = Instant.now();

    if (p.getBoostedUntil() != null && p.getBoostedUntil().isAfter(now)) {
      return new BoostStatus(true, p.getBoostedUntil());
    }

    Instant until = now.plus(24, ChronoUnit.HOURS);
    p.setBoostedUntil(until);
    return new BoostStatus(true, until);
  }

  private Profile profile() {
    return profiles.findByUserId(current.id())
        .orElseThrow(() -> new NotFoundException("Profile not found"));
  }
}
