package com.soulsync.service;

import com.soulsync.domain.Enums.VerificationPurpose;
import com.soulsync.exception.*;
import com.soulsync.repository.*;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service @RequiredArgsConstructor
public class AccountService {
  private final CurrentUser current;
  private final UserRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordEncoder encoder;
  private final OtpService otp;
  private final SmsGateway sms;
  @Value("${soulsync.dev-mode}") boolean devMode;

  public record OtpRequestResult(String message,long expiresInSeconds,long retryAfterSeconds,String devCode){}
  public record VerificationResult(String message,String phoneNumber,boolean phoneVerified){}

  @Transactional
  public void changePassword(String currentPassword,String newPassword){
    var u=current.entity();
    if(!encoder.matches(currentPassword,u.getPasswordHash())) throw new BadRequestException("Current password is incorrect");
    u.setPasswordHash(encoder.encode(newPassword));
    refreshTokens.revokeAllForUser(u.getId());
  }

  @Transactional
  public OtpRequestResult requestPhoneVerification(String rawPhone){
    String phone=normalizePhone(rawPhone);
    var owner=users.findByPhoneNumber(phone);
    if(owner.isPresent()&&!owner.get().getId().equals(current.id())) throw new ConflictException("That phone number is already associated with another account");
    var issued=otp.issue(current.entity(),VerificationPurpose.PHONE_VERIFY,phone);
    sms.sendVerificationCode(phone,issued.code(),otp.expiryMinutes());
    return new OtpRequestResult("Verification code sent to " + maskPhone(phone) + ".",Duration.between(Instant.now(),issued.expiresAt()).toSeconds(),issued.retryAfterSeconds(),devMode?issued.code():null);
  }

  @Transactional
  public VerificationResult verifyPhone(String code){
    var u=current.entity();
    String phone=otp.verify(u,VerificationPurpose.PHONE_VERIFY,code);
    var owner=users.findByPhoneNumber(phone);
    if(owner.isPresent()&&!owner.get().getId().equals(u.getId())) throw new ConflictException("That phone number is already associated with another account");
    u.setPhoneNumber(phone);
    u.setPhoneVerified(true);
    return new VerificationResult("Phone number verified.",phone,true);
  }

  @Transactional
  public void delete(String password){
    var u=current.entity();
    if(!encoder.matches(password,u.getPasswordHash()))throw new BadRequestException("Password is incorrect");
    users.delete(u);
  }

  private String normalizePhone(String input){
    if(input==null) throw new BadRequestException("Phone number is required");
    String phone=input.replaceAll("[\\s().-]","");
    if(!phone.matches("^\\+[1-9]\\d{7,14}$")) throw new BadRequestException("Use international E.164 format, for example +14695551234");
    return phone;
  }
  private String maskPhone(String phone){
    if(phone.length()<6)return phone;
    return phone.substring(0,Math.min(3,phone.length()-4))+"••••"+phone.substring(phone.length()-4);
  }
}
