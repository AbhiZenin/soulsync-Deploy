package com.soulsync.web.dto;

import com.soulsync.domain.Enums.*;
import jakarta.validation.constraints.*;

import java.time.*;
import java.util.*;

public final class ProfileDtos {

  private ProfileDtos() {}

  public record PhotoDto(
      UUID id,
      String url,
      int sortOrder,
      boolean primary,
      PhotoVisibility visibility
  ) {}

  public record ProfileCard(
      UUID userId,
      String displayName,
      Integer age,
      String gender,
      Integer heightCm,
      String city,
      String state,
      String country,
      String religion,
      String motherTongue,
      String education,
      String occupation,
      String primaryPhoto,
      Integer matchScore,
      Instant lastActiveAt,
      boolean emailVerified
  ) {}

  public record ProfileDetail(
      UUID userId,
      String displayName,
      LocalDate dateOfBirth,
      Integer age,
      String gender,
      Integer heightCm,
      String maritalStatus,
      String motherTongue,
      String religion,
      String community,
      String country,
      String state,
      String city,
      String education,
      String occupation,
      String incomeRange,
      String diet,
      String smoking,
      String drinking,
      String about,
      String profileCreatedBy,
      ProfileVisibility visibility,
      int completionPercent,
      Instant lastActiveAt,
      List<PhotoDto> photos,
      boolean emailVerified
  ) {}

  public record ProfileUpdate(
      @NotBlank @Size(max = 120) String displayName,
      LocalDate dateOfBirth,
      @Size(max = 50) String gender,
      @Min(100) @Max(250) Integer heightCm,
      @Size(max = 80) String maritalStatus,
      @Size(max = 80) String motherTongue,
      @Size(max = 100) String religion,
      @Size(max = 100) String community,
      @Size(max = 100) String country,
      @Size(max = 100) String state,
      @Size(max = 100) String city,
      @Size(max = 200) String education,
      @Size(max = 200) String occupation,
      @Size(max = 100) String incomeRange,
      @Size(max = 80) String diet,
      @Size(max = 80) String smoking,
      @Size(max = 80) String drinking,
      @Size(max = 3000) String about,
      @Size(max = 80) String profileCreatedBy,
      ProfileVisibility visibility
  ) {}

  public record PreferenceDto(
      Integer minAge,
      Integer maxAge,
      Integer minHeightCm,
      Integer maxHeightCm,
      String country,
      String state,
      String religion,
      String motherTongue,
      String education,
      String occupation,
      String diet
  ) {}

  public record PreferenceUpdate(
      @Min(18) @Max(100) Integer minAge,
      @Min(18) @Max(100) Integer maxAge,
      @Min(100) @Max(250) Integer minHeightCm,
      @Min(100) @Max(250) Integer maxHeightCm,
      @Size(max = 100) String country,
      @Size(max = 100) String state,
      @Size(max = 100) String religion,
      @Size(max = 80) String motherTongue,
      @Size(max = 200) String education,
      @Size(max = 200) String occupation,
      @Size(max = 80) String diet
  ) {}

  public record SearchFilter(
      Integer minAge,
      Integer maxAge,
      String gender,
      String country,
      String state,
      String city,
      String religion,
      String motherTongue,
      String education,
      String occupation,
      Integer minHeightCm,
      Integer maxHeightCm
  ) {}
}