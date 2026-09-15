package com.soulsync.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class JwtService {
  private final SecretKey key; private final long accessMinutes;
  public JwtService(@Value("${soulsync.jwt.secret}") String secret,@Value("${soulsync.jwt.access-minutes}") long accessMinutes){
    if(secret.getBytes(StandardCharsets.UTF_8).length<32) throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
    this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.accessMinutes=accessMinutes;
  }
  public String issue(UUID userId,String role){ var now=Instant.now(); return Jwts.builder().subject(userId.toString()).claim("role",role).issuedAt(Date.from(now)).expiration(Date.from(now.plus(accessMinutes,ChronoUnit.MINUTES))).signWith(key).compact(); }
  public Claims parse(String token){ return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
