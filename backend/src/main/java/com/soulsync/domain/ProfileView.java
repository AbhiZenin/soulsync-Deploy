package com.soulsync.domain;
import jakarta.persistence.*; import lombok.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="profile_views") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileView { @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="viewer_id",nullable=false) private User viewer; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="viewed_id",nullable=false) private User viewed; @Column(name="viewed_at",nullable=false) private Instant viewedAt; @PrePersist void pre(){if(id==null)id=UUID.randomUUID();if(viewedAt==null)viewedAt=Instant.now();} }
