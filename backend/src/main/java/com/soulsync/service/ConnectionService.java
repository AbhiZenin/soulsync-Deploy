package com.soulsync.service;

import com.soulsync.domain.*;
import com.soulsync.domain.Enums.*;
import com.soulsync.exception.*;
import com.soulsync.repository.*;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ConnectionService {

  private final InterestRepository interests;
  private final ShortlistRepository shortlists;
  private final UserRepository users;
  private final BlockRepository blocks;
  private final NotificationRepository notifications;
  private final CurrentUser current;

  public record InterestDto(
      UUID id,
      UUID senderId,
      UUID receiverId,
      InterestStatus status,
      java.time.Instant createdAt
  ) {}

  public record ShortlistDto(
      UUID id,
      UUID userId,
      java.time.Instant createdAt
  ) {}

  @Transactional
  public InterestDto send(UUID targetId) {
    UUID me = current.id();

    if (me.equals(targetId)) {
      throw new BadRequestException("You cannot send interest to yourself");
    }

    if (blocked(me, targetId)) {
      throw new ForbiddenException("This profile is unavailable");
    }

    var target = user(targetId);

    var existing = interests.findBySenderIdAndReceiverId(me, targetId);

    if (existing.isPresent()
        && existing.get().getStatus() == InterestStatus.PENDING) {
      throw new ConflictException("Interest already sent");
    }

    Interest i = existing.orElseGet(
        () -> Interest.builder()
            .sender(current.entity())
            .receiver(target)
            .build()
    );

    i.setStatus(InterestStatus.PENDING);
    i = interests.save(i);

    notify(
        target,
        NotificationType.INTEREST,
        "New interest",
        "Someone is interested in your profile."
    );

    return dto(i);
  }

  @Transactional
  public InterestDto respond(UUID id, boolean accept) {

    var i = interests
        .findByIdAndReceiverId(id, current.id())
        .orElseThrow(() -> new NotFoundException("Interest not found"));

    if (i.getStatus() != InterestStatus.PENDING) {
      throw new ConflictException("Interest has already been handled");
    }

    i.setStatus(
        accept
            ? InterestStatus.ACCEPTED
            : InterestStatus.DECLINED
    );

    if (accept) {
      notify(
          i.getSender(),
          NotificationType.MATCH,
          "It's a match",
          "Your interest was accepted. You can start a conversation."
      );
    }

    return dto(i);
  }

  @Transactional
  public InterestDto withdraw(UUID id) {

    var i = interests
        .findById(id)
        .orElseThrow(() -> new NotFoundException("Interest not found"));

    if (!i.getSender().getId().equals(current.id())) {
      throw new ForbiddenException("Not your interest");
    }

    if (i.getStatus() != InterestStatus.PENDING) {
      throw new ConflictException(
          "Only pending interests can be withdrawn"
      );
    }

    i.setStatus(InterestStatus.WITHDRAWN);

    return dto(i);
  }

  @Transactional(readOnly = true)
  public List<InterestDto> sent() {
    return interests
        .findBySenderIdOrderByCreatedAtDesc(current.id())
        .stream()
        .map(this::dto)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<InterestDto> received() {
    return interests
        .findByReceiverIdOrderByCreatedAtDesc(current.id())
        .stream()
        .map(this::dto)
        .toList();
  }

  @Transactional
  public ShortlistDto shortlist(UUID targetId) {

    if (current.id().equals(targetId)) {
      throw new BadRequestException("Cannot shortlist yourself");
    }

    var existing =
        shortlists.findByUserIdAndTargetUserId(
            current.id(),
            targetId
        );

    var s = existing.orElseGet(
        () -> shortlists.save(
            Shortlist.builder()
                .user(current.entity())
                .targetUser(user(targetId))
                .build()
        )
    );

    return new ShortlistDto(
        s.getId(),
        s.getTargetUser().getId(),
        s.getCreatedAt()
    );
  }

  @Transactional
  public void unshortlist(UUID targetId) {
    shortlists
        .findByUserIdAndTargetUserId(current.id(), targetId)
        .ifPresent(shortlists::delete);
  }

  @Transactional(readOnly = true)
  public List<ShortlistDto> shortlist() {
    return shortlists
        .findByUserIdOrderByCreatedAtDesc(current.id())
        .stream()
        .map(
            s -> new ShortlistDto(
                s.getId(),
                s.getTargetUser().getId(),
                s.getCreatedAt()
            )
        )
        .toList();
  }

  @Transactional(readOnly = true)
  public boolean connected(UUID a, UUID b) {
    return interests
        .existsBySenderIdAndReceiverIdAndStatus(
            a,
            b,
            InterestStatus.ACCEPTED
        )
        || interests
        .existsBySenderIdAndReceiverIdAndStatus(
            b,
            a,
            InterestStatus.ACCEPTED
        );
  }

  private boolean blocked(UUID a, UUID b) {
    return blocks.existsByBlockerIdAndBlockedId(a, b)
        || blocks.existsByBlockerIdAndBlockedId(b, a);
  }

  private User user(UUID id) {
    return users
        .findById(id)
        .orElseThrow(() -> new NotFoundException("User not found"));
  }

  private InterestDto dto(Interest i) {
    return new InterestDto(
        i.getId(),
        i.getSender().getId(),
        i.getReceiver().getId(),
        i.getStatus(),
        i.getCreatedAt()
    );
  }

  private void notify(
      User u,
      NotificationType type,
      String title,
      String body
  ) {
    notifications.save(
        Notification.builder()
            .user(u)
            .type(type)
            .title(title)
            .body(body)
            .build()
    );
  }
}