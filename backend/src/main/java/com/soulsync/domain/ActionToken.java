package com.soulsync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="action_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActionToken {
 @Id private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Column(name="token_hash",nullable=false,unique=true,length=64) private String tokenHash;
 @Column(nullable=false) private String purpose;
 @Column(name="expires_at",nullable=false) private Instant expiresAt;
 @Column(nullable=false) @Builder.Default private boolean used=false;
 @Column(name="created_at",nullable=false) private Instant createdAt;
 @PrePersist void pre(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();}
}
