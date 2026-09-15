package com.soulsync.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
  private final JavaMailSender sender;
  @Value("${soulsync.mail-enabled}") boolean enabled;
  @Value("${soulsync.frontend-url}") String frontend;
  @Value("${soulsync.mail-from:no-reply@soulsync.local}") String from;

  public void verificationCode(String email, String code, int expiryMinutes){
    if(!enabled) return;
    var m=new SimpleMailMessage();
    m.setFrom(from);
    m.setTo(email);
    m.setSubject("Your SoulSync verification code");
    m.setText("Your SoulSync verification code is " + code + ".\n\nIt expires in " + expiryMinutes + " minutes. Do not share this code with anyone.\n\nIf you did not create a SoulSync account, you can ignore this email.");
    sender.send(m);
  }

  public void passwordReset(String email,String token){
    if(!enabled)return;
    var m=new SimpleMailMessage();
    m.setFrom(from);
    m.setTo(email);
    m.setSubject("Reset your SoulSync password");
    m.setText("Reset your password: "+frontend+"/reset-password?token="+token);
    sender.send(m);
  }
}
