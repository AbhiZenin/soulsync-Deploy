package com.soulsync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;
import com.soulsync.domain.Enums.*;

@Entity @Table(name="users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
  @Id private UUID id;
  @Column(nullable=false, unique=true) private String email;
  @Column(name="password_hash", nullable=false) private String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable=false) @Builder.Default private UserStatus status = UserStatus.ACTIVE;
  @Enumerated(EnumType.STRING) @Column(nullable=false) @Builder.Default private Role role = Role.USER;
  @Column(name="email_verified", nullable=false) @Builder.Default private boolean emailVerified = false;
  @Column(name="phone_number", unique=true, length=20) private String phoneNumber;
  @Column(name="phone_verified", nullable=false) @Builder.Default private boolean phoneVerified = false;
  @Column(name="created_at", nullable=false) private Instant createdAt;
  @Column(name="updated_at", nullable=false) private Instant updatedAt;
  @PrePersist void prePersist(){ var now=Instant.now(); if(id==null) id=UUID.randomUUID(); if(createdAt==null) createdAt=now; updatedAt=now; }
  @PreUpdate void preUpdate(){ updatedAt=Instant.now(); }
}
