package com.soulsync.web;

import com.soulsync.security.CurrentUser;
import com.soulsync.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/account") @RequiredArgsConstructor
public class AccountController {
  private final CurrentUser current;
  private final AccountService service;
  public record AccountDto(UUID id,String email,String role,boolean emailVerified,String phoneNumber,boolean phoneVerified,boolean identityVerified,String status,Instant createdAt){}
  public record ChangePasswordRequest(@NotBlank String currentPassword,@Size(min=8,max=72)String newPassword){}
  public record DeleteRequest(@NotBlank String password){}
  public record PhoneRequest(@NotBlank @Size(max=30) String phoneNumber){}
  public record PhoneVerifyRequest(@NotBlank @Pattern(regexp="\\d{6}", message="code must be 6 digits") String code){}

  @GetMapping("/me") AccountDto me(){
    var u=current.entity();
    return new AccountDto(u.getId(),u.getEmail(),u.getRole().name(),u.isEmailVerified(),u.getPhoneNumber(),u.isPhoneVerified(),u.isEmailVerified()&&u.isPhoneVerified(),u.getStatus().name(),u.getCreatedAt());
  }
  @PostMapping("/phone/request") AccountService.OtpRequestResult requestPhone(@Valid @RequestBody PhoneRequest r){return service.requestPhoneVerification(r.phoneNumber());}
  @PostMapping("/phone/verify") AccountService.VerificationResult verifyPhone(@Valid @RequestBody PhoneVerifyRequest r){return service.verifyPhone(r.code());}
  @PostMapping("/change-password") ResponseEntity<Void> change(@Valid @RequestBody ChangePasswordRequest r){service.changePassword(r.currentPassword(),r.newPassword());return ResponseEntity.noContent().build();}
  @PostMapping("/delete") ResponseEntity<Void> delete(@Valid @RequestBody DeleteRequest r){service.delete(r.password());return ResponseEntity.noContent().build();}
}
