package com.soulsync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="partner_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PartnerPreference {
  @Id private UUID id;
  @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false, unique=true) private User user;
  @Column(name="min_age") @Builder.Default private Integer minAge=21;
  @Column(name="max_age") @Builder.Default private Integer maxAge=40;
  @Column(name="min_height_cm") private Integer minHeightCm;
  @Column(name="max_height_cm") private Integer maxHeightCm;
  private String country; private String state; private String religion;
  @Column(name="mother_tongue") private String motherTongue;
  private String education; private String occupation; private String diet;
  @Column(name="created_at",nullable=false) private Instant createdAt;
  @Column(name="updated_at",nullable=false) private Instant updatedAt;
  @PrePersist void pre(){var n=Instant.now();if(id==null)id=UUID.randomUUID();if(createdAt==null)createdAt=n;updatedAt=n;}
  @PreUpdate void up(){updatedAt=Instant.now();}
}
