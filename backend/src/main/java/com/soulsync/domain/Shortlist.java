package com.soulsync.domain;
import jakarta.persistence.*; import lombok.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="shortlists",uniqueConstraints=@UniqueConstraint(name="uk_shortlist_pair",columnNames={"user_id","target_user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Shortlist { @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private User user; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="target_user_id",nullable=false) private User targetUser; @Column(name="created_at",nullable=false) private Instant createdAt; @PrePersist void pre(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();} }
