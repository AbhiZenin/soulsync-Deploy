package com.soulsync.service;

public interface SmsGateway {
  void sendVerificationCode(String phoneNumber, String code, int expiryMinutes);
}
