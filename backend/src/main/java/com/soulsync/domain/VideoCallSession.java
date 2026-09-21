package com.soulsync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "video_call_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VideoCallSession {
  @Id private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "caller_id", nullable = false)
  private User caller;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "callee_id", nullable = false)
  private User callee;

  @Column(name = "room_name", nullable = false, unique = true, length = 160)
  private String roomName;

  @Column(nullable = false, length = 30)
  @Builder.Default
  private String status = "ACTIVE";

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    if (id == null) id = UUID.randomUUID();
    if (createdAt == null) createdAt = Instant.now();
  }
}
