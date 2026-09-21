package com.soulsync.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;
import java.util.UUID;
import com.soulsync.domain.Enums.ProfileVisibility;

@Entity @Table(name="profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile {
  @Id private UUID id;
  @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id", nullable=false, unique=true) private User user;
  @Column(name="display_name", nullable=false) private String displayName;
  @Column(name="date_of_birth") private LocalDate dateOfBirth;
  private String gender;
  @Column(name="height_cm") private Integer heightCm;
  @Column(name="marital_status") private String maritalStatus;
  @Column(name="mother_tongue") private String motherTongue;
  private String religion;
  private String community;
  private String country;
  private String state;
  private String city;
  private String education;
  private String occupation;
  @Column(name="income_range") private String incomeRange;
  private String diet;
  private String smoking;
  private String drinking;
  @Column(length = 1000) private String hobbies; @Column(length=3000) private String about;
  @Column(name="profile_created_by") private String profileCreatedBy;
  @Enumerated(EnumType.STRING) @Column(nullable=false) @Builder.Default private ProfileVisibility visibility=ProfileVisibility.MEMBERS;
  @Column(name="completion_percent", nullable=false) @Builder.Default private int completionPercent=10;
  @Column(name="last_active_at") private Instant lastActiveAt;

  @Column(name = "boosted_until")
  private Instant boostedUntil;
  @Column(name="created_at", nullable=false) private Instant createdAt;
  @Column(name="updated_at", nullable=false) private Instant updatedAt;
  @PrePersist void prePersist(){var now=Instant.now(); if(id==null) id=UUID.randomUUID(); if(createdAt==null) createdAt=now; updatedAt=now; if(lastActiveAt==null) lastActiveAt=now;}
  @PreUpdate void preUpdate(){updatedAt=Instant.now();}
}
