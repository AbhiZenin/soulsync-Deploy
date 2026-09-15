package com.soulsync.domain;
import jakarta.persistence.*; import lombok.*; import java.time.Instant; import java.util.UUID;
@Entity @Table(name="blocks",uniqueConstraints=@UniqueConstraint(name="uk_block_pair",columnNames={"blocker_id","blocked_id"})) @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Block { @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="blocker_id",nullable=false) private User blocker; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="blocked_id",nullable=false) private User blocked; @Column(name="created_at",nullable=false) private Instant createdAt; @PrePersist void pre(){if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=Instant.now();} }
