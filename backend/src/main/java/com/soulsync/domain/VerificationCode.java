package com.soulsync.domain;

import com.soulsync.domain.Enums.VerificationPurpose;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="verification_codes", indexes = {
    @Index(name="idx_verification_user_purpose", columnList="user_id,purpose,created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VerificationCode {
  @Id private UUID id;
  @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
  @Enumerated(EnumType.STRING) @Column(nullable=false, length=40) private VerificationPurpose purpose;
  @Column(nullable=false, length=320) private String target;
  @Column(name="code_hash", nullable=false, length=255) private String codeHash;
  @Column(name="expires_at", nullable=false) private Instant expiresAt;
  @Column(name="resend_available_at", nullable=false) private Instant resendAvailableAt;
  @Column(nullable=false) @Builder.Default private int attempts = 0;
  @Column(name="max_attempts", nullable=false) @Builder.Default private int maxAttempts = 5;
  @Column(nullable=false) @Builder.Default private boolean used = false;
  @Column(name="created_at", nullable=false) private Instant createdAt;

  @PrePersist void prePersist(){
    if(id==null) id=UUID.randomUUID();
    if(createdAt==null) createdAt=Instant.now();
  }
}
