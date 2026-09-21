package com.soulsync.service;

import com.soulsync.web.dto.ProfileDtos.ProfileCard;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnhancedDiscoveryService {

  private final ProfileService profiles;
  private final SubscriptionAccessService subscriptionAccess;

  public record EnhancedDiscoveryDto(
      List<ProfileCard> topCompatibility,
      List<ProfileCard> recentlyActive
  ) {}

  @Transactional(readOnly = true)
  public EnhancedDiscoveryDto mine() {
    subscriptionAccess.require(
        "ENHANCED_DISCOVERY",
        "Enhanced discovery is available on Premium and Premium Plus."
    );

    List<ProfileCard> recommendations = profiles.recommendations();

    List<ProfileCard> topCompatibility = recommendations
        .stream()
        .limit(8)
        .toList();

    Comparator<ProfileCard> recentFirst =
        Comparator.comparing(
            ProfileCard::lastActiveAt,
            Comparator.nullsLast(
                Comparator.<Instant>reverseOrder()
            )
        );

    List<ProfileCard> recentlyActive = recommendations
        .stream()
        .sorted(recentFirst)
        .limit(8)
        .toList();

    return new EnhancedDiscoveryDto(
        topCompatibility,
        recentlyActive
    );
  }
}
