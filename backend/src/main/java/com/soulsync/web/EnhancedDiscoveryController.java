package com.soulsync.web;

import com.soulsync.service.EnhancedDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/discovery")
@RequiredArgsConstructor
public class EnhancedDiscoveryController {

  private final EnhancedDiscoveryService service;

  @GetMapping("/enhanced")
  EnhancedDiscoveryService.EnhancedDiscoveryDto enhanced() {
    return service.mine();
  }
}
