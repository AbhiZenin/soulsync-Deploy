package com.soulsync.web;

import com.soulsync.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth") @RequiredArgsConstructor
public class AuthController {
  private final AuthService auth;
  public record RegisterRequest(@Email @NotBlank String email,@Size(min=8,max=72) String password,@NotBlank @Size(max=120) String displayName){}
  public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
  public record RefreshRequest(@NotBlank String refreshToken){}
  public record VerifyEmailRequest(String email,String code,String token){}
  public record ResetRequest(@NotBlank String token,@Size(min=8,max=72) String password){}
  public record ForgotRequest(@Email @NotBlank String email){}

  @PostMapping("/register") ResponseEntity<AuthService.RegisterResult> register(@Valid @RequestBody RegisterRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(r.email(),r.password(),r.displayName()));}
  @PostMapping("/login") AuthService.TokenPair login(@Valid @RequestBody LoginRequest r){return auth.login(r.email(),r.password());}
  @PostMapping("/refresh") AuthService.TokenPair refresh(@Valid @RequestBody RefreshRequest r){return auth.refresh(r.refreshToken());}
  @PostMapping("/logout") ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest r){auth.logout(r.refreshToken());return ResponseEntity.noContent().build();}
  @PostMapping("/verify-email") AuthService.MessageResult verify(@RequestBody VerifyEmailRequest r){return auth.verifyEmail(r.email(),r.code(),r.token());}
  @PostMapping("/email-otp/resend") AuthService.OtpRequestResult resend(@Valid @RequestBody ForgotRequest r){return auth.resendEmailOtp(r.email());}
  @PostMapping("/forgot-password") AuthService.MessageResult forgot(@Valid @RequestBody ForgotRequest r){return auth.forgotPassword(r.email());}
  @PostMapping("/reset-password") AuthService.MessageResult reset(@Valid @RequestBody ResetRequest r){return auth.resetPassword(r.token(),r.password());}
}
