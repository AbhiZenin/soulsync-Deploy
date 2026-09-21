package com.soulsync.service;

import com.soulsync.domain.VideoCallSession;
import com.soulsync.exception.ForbiddenException;
import com.soulsync.exception.NotFoundException;
import com.soulsync.repository.BlockRepository;
import com.soulsync.repository.UserRepository;
import com.soulsync.repository.VideoCallSessionRepository;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoCallService {
  private final VideoCallSessionRepository sessions;
  private final UserRepository users;
  private final BlockRepository blocks;
  private final CurrentUser current;
  private final ConnectionService connections;
  private final SubscriptionAccessService subscriptionAccess;

  @Value("${soulsync.video.base-url:https://meet.jit.si}")
  private String videoBaseUrl;

  public record VideoCallDto(
      UUID id,
      UUID callerId,
      UUID calleeId,
      String joinUrl,
      Instant expiresAt
  ) {}

  @Transactional
  public VideoCallDto create(UUID targetId) {
    subscriptionAccess.require(
        "VIDEO_CALL",
        "Video calls are available on Premium Plus."
    );

    UUID me = current.id();

    if (me.equals(targetId)) {
      throw new ForbiddenException("You cannot start a video call with yourself.");
    }

    if (blocks.existsByBlockerIdAndBlockedId(me, targetId)
        || blocks.existsByBlockerIdAndBlockedId(targetId, me)) {
      throw new ForbiddenException("This profile is unavailable.");
    }

    if (!connections.connected(me, targetId)) {
      throw new ForbiddenException(
          "Video calls are available after a mutual connection."
      );
    }

    var callee = users.findById(targetId)
        .orElseThrow(() -> new NotFoundException("User not found"));

    String room = "soulsync-" + UUID.randomUUID().toString().replace("-", "");

    var session = sessions.save(
        VideoCallSession.builder()
            .caller(current.entity())
            .callee(callee)
            .roomName(room)
            .status("ACTIVE")
            .expiresAt(Instant.now().plus(2, ChronoUnit.HOURS))
            .build()
    );

    return dto(session);
  }

  @Transactional(readOnly = true)
  public VideoCallDto get(UUID id) {
    var session = sessions.findById(id)
        .orElseThrow(() -> new NotFoundException("Video call not found"));

    UUID me = current.id();
    if (!session.getCaller().getId().equals(me)
        && !session.getCallee().getId().equals(me)) {
      throw new ForbiddenException("Video call unavailable.");
    }

    if (!"ACTIVE".equals(session.getStatus())
        || session.getExpiresAt().isBefore(Instant.now())) {
      throw new ForbiddenException("This video call has expired.");
    }

    UUID caller = session.getCaller().getId();
    UUID callee = session.getCallee().getId();
    if (blocks.existsByBlockerIdAndBlockedId(caller, callee)
        || blocks.existsByBlockerIdAndBlockedId(callee, caller)) {
      throw new ForbiddenException("Video call unavailable.");
    }

    return dto(session);
  }

  private VideoCallDto dto(VideoCallSession session) {
    String base = videoBaseUrl == null || videoBaseUrl.isBlank()
        ? "https://meet.jit.si"
        : videoBaseUrl.trim();

    while (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }

    return new VideoCallDto(
        session.getId(),
        session.getCaller().getId(),
        session.getCallee().getId(),
        base + "/" + session.getRoomName(),
        session.getExpiresAt()
    );
  }
}
