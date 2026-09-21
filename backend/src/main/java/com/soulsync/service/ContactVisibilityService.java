package com.soulsync.service;

import com.soulsync.exception.BadRequestException;
import com.soulsync.exception.ForbiddenException;
import com.soulsync.exception.NotFoundException;
import com.soulsync.repository.BlockRepository;
import com.soulsync.repository.UserRepository;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactVisibilityService {

  private final UserRepository users;
  private final BlockRepository blocks;
  private final CurrentUser current;
  private final ConnectionService connections;
  private final SubscriptionAccessService subscriptionAccess;

  public record ContactDto(
      UUID userId,
      String email,
      String phoneNumber
  ) {}

  @Transactional(readOnly = true)
  public ContactDto contact(UUID targetId) {
    subscriptionAccess.require(
        "VIEW_CONTACT",
        "Contact visibility is available on Premium and Premium Plus."
    );

    UUID me = current.id();

    if (me.equals(targetId)) {
      throw new BadRequestException(
          "Open Settings to view your own account contact information."
      );
    }

    if (blocks.existsByBlockerIdAndBlockedId(me, targetId)
        || blocks.existsByBlockerIdAndBlockedId(targetId, me)) {
      throw new ForbiddenException("This profile is unavailable.");
    }

    if (!connections.connected(me, targetId)) {
      throw new ForbiddenException(
          "Contact details become available after a mutual connection."
      );
    }

    var target = users
        .findById(targetId)
        .orElseThrow(() -> new NotFoundException("User not found"));

    String phone = target.getPhoneNumber();

    if (phone != null && phone.isBlank()) {
      phone = null;
    }

    return new ContactDto(
        target.getId(),
        target.getEmail(),
        phone
    );
  }
}
