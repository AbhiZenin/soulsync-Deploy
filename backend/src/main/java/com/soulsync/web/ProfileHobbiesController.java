package com.soulsync.web;

import com.soulsync.exception.NotFoundException;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.security.CurrentUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile/hobbies")
@RequiredArgsConstructor
public class ProfileHobbiesController {

  private final ProfileRepository profiles;
  private final CurrentUser current;

  public record HobbiesDto(String hobbies) {}

  public record UpdateHobbiesRequest(
      @Size(max = 1000, message = "Hobbies must be 1000 characters or less")
      String hobbies
  ) {}

  @GetMapping
  @Transactional(readOnly = true)
  public HobbiesDto mine() {
    var profile = profiles.findByUserId(current.id())
        .orElseThrow(() -> new NotFoundException("Profile not found"));

    return new HobbiesDto(profile.getHobbies());
  }

  @PutMapping
  @Transactional
  public HobbiesDto update(@Valid @RequestBody UpdateHobbiesRequest request) {
    var profile = profiles.findByUserId(current.id())
        .orElseThrow(() -> new NotFoundException("Profile not found"));

    profile.setHobbies(clean(request.hobbies()));
    return new HobbiesDto(profile.getHobbies());
  }

  private static String clean(String value) {
    if (value == null) return null;

    String cleaned = value.trim();
    return cleaned.isEmpty() ? null : cleaned;
  }
}
