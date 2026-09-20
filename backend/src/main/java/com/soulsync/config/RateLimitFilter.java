package com.soulsync.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

  private record Bucket(long minute, int count) {}

  private final ConcurrentHashMap<String, Bucket> buckets =
      new ConcurrentHashMap<>();

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {

    String path = request.getRequestURI();

    return !(
        path.equals("/api/v1/auth/login")
        || path.equals("/api/v1/auth/register")
        || path.equals("/api/v1/auth/forgot-password")
        || path.equals("/api/v1/auth/reset-password")
        || path.equals("/api/v1/auth/verify-email")
        || path.equals("/api/v1/auth/email-otp/resend")
    );
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {

    long minute = Instant.now().getEpochSecond() / 60;

    String forwarded = request.getHeader("X-Forwarded-For");

    String ip =
        forwarded == null
            ? request.getRemoteAddr()
            : forwarded.split(",")[0].trim();

    String key = ip + "|" + request.getRequestURI();

    Bucket bucket = buckets.compute(
        key,
        (k, old) ->
            old == null || old.minute() != minute
                ? new Bucket(minute, 1)
                : new Bucket(minute, old.count() + 1)
    );

    if (bucket.count() > 12) {
      response.setStatus(429);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response
          .getWriter()
          .write(
              "{\"message\":\"Too many requests. Try again shortly.\"}"
          );
      return;
    }

    filterChain.doFilter(request, response);

    if (buckets.size() > 10000) {
      buckets
          .entrySet()
          .removeIf(
              entry -> entry.getValue().minute() < minute - 5
          );
    }
  }
}