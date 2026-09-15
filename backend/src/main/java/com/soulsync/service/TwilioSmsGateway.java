package com.soulsync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
@ConditionalOnProperty(name="soulsync.sms.provider", havingValue="twilio")
public class TwilioSmsGateway implements SmsGateway {
  @Value("${soulsync.sms.twilio.account-sid:}") String accountSid;
  @Value("${soulsync.sms.twilio.auth-token:}") String authToken;
  @Value("${soulsync.sms.twilio.from-number:}") String fromNumber;

  private final RestClient client = RestClient.create();

  @Override
  public void sendVerificationCode(String phoneNumber, String code, int expiryMinutes) {
    if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
      throw new IllegalStateException("Twilio SMS credentials are incomplete");
    }
    var form = new LinkedMultiValueMap<String, String>();
    form.add("To", phoneNumber);
    form.add("From", fromNumber);
    form.add("Body", "Your SoulSync verification code is " + code + ". It expires in " + expiryMinutes + " minutes. Do not share this code.");
    try {
      client.post()
          .uri("https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json", accountSid)
          .headers(h -> h.setBasicAuth(accountSid, authToken))
          .contentType(MediaType.APPLICATION_FORM_URLENCODED)
          .body(form)
          .retrieve()
          .toBodilessEntity();
    } catch (RestClientResponseException e) {
      throw new IllegalStateException("SMS provider rejected the verification message (HTTP " + e.getStatusCode().value() + ")");
    }
  }
}
