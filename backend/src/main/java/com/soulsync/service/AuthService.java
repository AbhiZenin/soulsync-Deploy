package com.soulsync.service;

import com.soulsync.domain.*;
import com.soulsync.domain.Enums.*;
import com.soulsync.exception.*;
import com.soulsync.repository.*;
import com.soulsync.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service @RequiredArgsConstructor
public class AuthService {
  private final UserRepository users;
  private final ProfileRepository profiles;
  private final PartnerPreferenceRepository preferences;
  private final SubscriptionRepository subscriptions;
  private final RefreshTokenRepository refreshTokens;
  private final ActionTokenRepository actionTokens;
  private final PasswordEncoder encoder;
  private final JwtService jwt;
  private final MailService mail;
  private final OtpService otp;

  @Value("${soulsync.jwt.refresh-days}") long refreshDays;
  @Value("${soulsync.jwt.access-minutes}") long accessMinutes;
  @Value("${soulsync.dev-mode}") boolean devMode;

  public record TokenPair(String accessToken,String refreshToken,long expiresInSeconds){}
  public record RegisterResult(UUID userId,String email,String message,String devVerificationCode,String devVerificationToken){}
  public record MessageResult(String message,String devToken){}
  public record OtpRequestResult(String message,long expiresInSeconds,long retryAfterSeconds,String devCode){}

  @Transactional
  public RegisterResult register(String email,String password,String displayName){
    email=email.trim().toLowerCase(Locale.ROOT);
    if(users.existsByEmailIgnoreCase(email)) throw new ConflictException("An account already exists for this email");
    var u=users.save(User.builder().id(UUID.randomUUID()).email(email).passwordHash(encoder.encode(password)).status(UserStatus.ACTIVE).role(Role.USER).build());
    profiles.save(Profile.builder().id(UUID.randomUUID()).user(u).displayName(displayName.trim()).build());
    preferences.save(PartnerPreference.builder().id(UUID.randomUUID()).user(u).build());
    subscriptions.save(Subscription.builder().id(UUID.randomUUID()).user(u).plan(Plan.FREE).build());

    var issued=otp.issue(u,VerificationPurpose.EMAIL_VERIFY,email);
    mail.verificationCode(email,issued.code(),otp.expiryMinutes());
    String devCode=devMode?issued.code():null;
    String legacyToken=devMode?encodeDevVerificationToken(email,issued.code()):null;
    return new RegisterResult(u.getId(),u.getEmail(),"Account created. Enter the 6-digit code sent to your email.",devCode,legacyToken);
  }

  @Transactional
  public TokenPair login(String email,String password){
    var u=users.findByEmailIgnoreCase(email.trim()).orElseThrow(()->new BadRequestException("Invalid email or password"));
    if(u.getStatus()!=UserStatus.ACTIVE||!encoder.matches(password,u.getPasswordHash())) throw new BadRequestException("Invalid email or password");
    if(!u.isEmailVerified()) throw new ForbiddenException("Verify your email before signing in");
    profiles.findByUserId(u.getId()).ifPresent(p->p.setLastActiveAt(Instant.now()));
    return issue(u);
  }

  @Transactional
  public MessageResult verifyEmail(String email,String code,String legacyToken){
    if ((email==null||email.isBlank()||code==null||code.isBlank()) && legacyToken!=null && !legacyToken.isBlank()) {
      String[] decoded=decodeDevVerificationToken(legacyToken);
      email=decoded[0]; code=decoded[1];
    }
    if(email==null||email.isBlank()) throw new BadRequestException("Email is required");
    var u=users.findByEmailIgnoreCase(email.trim()).orElseThrow(()->new BadRequestException("Invalid verification request"));
    if(u.isEmailVerified()) return new MessageResult("Email is already verified. You can sign in.",null);
    String target=otp.verify(u,VerificationPurpose.EMAIL_VERIFY,code);
    if(!u.getEmail().equalsIgnoreCase(target)) throw new BadRequestException("Verification request is invalid");
    u.setEmailVerified(true);
    return new MessageResult("Email verified. You can now sign in.",null);
  }

  @Transactional
  public OtpRequestResult resendEmailOtp(String email){
    var u=users.findByEmailIgnoreCase(email.trim()).orElse(null);
    if(u==null) return new OtpRequestResult("If that account exists, a verification code has been sent.",otp.expiryMinutes()*60L,60,null);
    if(u.isEmailVerified()) return new OtpRequestResult("Email is already verified.",0,0,null);
    var issued=otp.issue(u,VerificationPurpose.EMAIL_VERIFY,u.getEmail());
    mail.verificationCode(u.getEmail(),issued.code(),otp.expiryMinutes());
    return new OtpRequestResult("A new verification code has been sent.",Duration.between(Instant.now(),issued.expiresAt()).toSeconds(),issued.retryAfterSeconds(),devMode?issued.code():null);
  }

  @Transactional
  public MessageResult forgotPassword(String email){
    var ou=users.findByEmailIgnoreCase(email.trim());
    if(ou.isEmpty()) return new MessageResult("If that email exists, a reset link has been sent.",null);
    var u=ou.get();
    String raw=createActionToken(u,"RESET_PASSWORD",30,ChronoUnit.MINUTES);
    mail.passwordReset(u.getEmail(),raw);
    return new MessageResult("If that email exists, a reset link has been sent.",devMode?raw:null);
  }

  @Transactional
  public MessageResult resetPassword(String raw,String password){
    var t=validAction(raw,"RESET_PASSWORD");
    t.setUsed(true); t.getUser().setPasswordHash(encoder.encode(password));
    refreshTokens.revokeAllForUser(t.getUser().getId());
    return new MessageResult("Password updated. Sign in with your new password.",null);
  }

  @Transactional
  public TokenPair refresh(String raw){
    var old=refreshTokens.findByTokenHash(TokenUtil.sha256(raw)).orElseThrow(()->new BadRequestException("Invalid refresh token"));
    if(old.isRevoked()||old.getExpiresAt().isBefore(Instant.now())) throw new BadRequestException("Refresh token expired or revoked");
    if(old.getUser().getStatus()!=UserStatus.ACTIVE) throw new ForbiddenException("Account unavailable");
    old.setRevoked(true); return issue(old.getUser());
  }

  @Transactional public void logout(String raw){ refreshTokens.findByTokenHash(TokenUtil.sha256(raw)).ifPresent(t->t.setRevoked(true)); }

  private TokenPair issue(User u){
    String access=jwt.issue(u.getId(),u.getRole().name());
    String raw=TokenUtil.randomToken();
    refreshTokens.save(RefreshToken.builder().id(UUID.randomUUID()).user(u).tokenHash(TokenUtil.sha256(raw)).expiresAt(Instant.now().plus(refreshDays,ChronoUnit.DAYS)).build());
    return new TokenPair(access,raw,accessMinutes*60);
  }

  private String createActionToken(User u,String purpose,long amount,ChronoUnit unit){
    String raw=TokenUtil.randomToken();
    actionTokens.save(ActionToken.builder().id(UUID.randomUUID()).user(u).tokenHash(TokenUtil.sha256(raw)).purpose(purpose).expiresAt(Instant.now().plus(amount,unit)).build());
    return raw;
  }
  private ActionToken validAction(String raw,String purpose){
    var t=actionTokens.findByTokenHashAndPurpose(TokenUtil.sha256(raw),purpose).orElseThrow(()->new BadRequestException("Invalid or expired token"));
    if(t.isUsed()||t.getExpiresAt().isBefore(Instant.now())) throw new BadRequestException("Invalid or expired token");
    return t;
  }
  private String encodeDevVerificationToken(String email,String code){
    return Base64.getUrlEncoder().withoutPadding().encodeToString((email+":"+code).getBytes(StandardCharsets.UTF_8));
  }
  private String[] decodeDevVerificationToken(String token){
    try{
      String raw=new String(Base64.getUrlDecoder().decode(token),StandardCharsets.UTF_8);
      int i=raw.lastIndexOf(':');
      if(i<=0||i==raw.length()-1) throw new IllegalArgumentException();
      return new String[]{raw.substring(0,i),raw.substring(i+1)};
    }catch(Exception e){ throw new BadRequestException("Invalid verification request"); }
  }
}
