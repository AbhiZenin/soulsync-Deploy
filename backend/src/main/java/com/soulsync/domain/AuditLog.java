package com.soulsync.domain;
import jakarta.persistence.*; import lombok.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="audit_logs") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog { @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="actor_id") private User actor; @Column(nullable=false) private String action; @Column(name="target_type",nullable=false) private String targetType; @Column(name="target_id") private String targetId; @Column(length=2000) private String details; @Column(name="created_at",nullable=false) private Instant createdAt; @PrePersist void pre(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();} }
