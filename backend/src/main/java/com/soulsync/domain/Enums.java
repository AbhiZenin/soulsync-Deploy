package com.soulsync.domain;

public final class Enums {
  private Enums() {}
  public enum UserStatus { ACTIVE, SUSPENDED, DELETED }
  public enum Role { USER, ADMIN }
  public enum InterestStatus { PENDING, ACCEPTED, DECLINED, WITHDRAWN }
  public enum ReportStatus { OPEN, REVIEWING, RESOLVED, DISMISSED }
  public enum MessageType { TEXT, IMAGE, SYSTEM }
  public enum MessageStatus { SENT, DELIVERED, READ }
  public enum PhotoVisibility { PUBLIC, CONNECTIONS, PRIVATE }
  public enum PhotoModerationStatus { PENDING, APPROVED, REJECTED }
  public enum ProfileVisibility { PUBLIC, MEMBERS, HIDDEN }
  public enum NotificationType { INTEREST, MATCH, MESSAGE, PROFILE_VIEW, SYSTEM, SUBSCRIPTION }
  public enum Plan { FREE, PREMIUM, PREMIUM_PLUS }
  public enum VerificationPurpose { EMAIL_VERIFY, PHONE_VERIFY }
}
