package com.soulsync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "priority_support_tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PrioritySupportTicket {
  @Id private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, length = 200)
  private String subject;

  @Column(nullable = false, columnDefinition = "text")
  private String message;

  @Column(nullable = false, length = 30)
  @Builder.Default
  private String status = "OPEN";

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void prePersist() {
    Instant now = Instant.now();
    if (id == null) id = UUID.randomUUID();
    if (createdAt == null) createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
