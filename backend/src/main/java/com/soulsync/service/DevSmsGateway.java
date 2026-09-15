package com.soulsync.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name="soulsync.sms.provider", havingValue="dev", matchIfMissing=true)
public class DevSmsGateway implements SmsGateway {
  @Override public void sendVerificationCode(String phoneNumber, String code, int expiryMinutes) {
    // Intentionally no-op. In DEV_MODE the API returns the code to the local UI.
  }
}
