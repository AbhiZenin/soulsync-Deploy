package com.soulsync.web;

import com.soulsync.service.ContactVisibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactVisibilityController {

  private final ContactVisibilityService service;

  @GetMapping("/{userId}")
  ContactVisibilityService.ContactDto contact(
      @PathVariable UUID userId
  ) {
    return service.contact(userId);
  }
}
