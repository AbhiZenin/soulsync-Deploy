package com.soulsync.domain;
import jakarta.persistence.*; import lombok.*; import java.time.Instant; import java.util.UUID; import com.soulsync.domain.Enums.InterestStatus;
@Entity @Table(name="interests", uniqueConstraints=@UniqueConstraint(name="uk_interest_pair",columnNames={"sender_id","receiver_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interest {
 @Id private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="sender_id",nullable=false) private User sender;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="receiver_id",nullable=false) private User receiver;
 @Enumerated(EnumType.STRING) @Column(nullable=false) @Builder.Default private InterestStatus status=InterestStatus.PENDING;
 @Column(name="created_at",nullable=false) private Instant createdAt; @Column(name="updated_at",nullable=false) private Instant updatedAt;
 @PrePersist void pre(){var n=Instant.now();if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=n;updatedAt=n;} @PreUpdate void up(){updatedAt=Instant.now();}
}
