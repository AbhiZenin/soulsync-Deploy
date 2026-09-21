package com.soulsync.web;

import com.soulsync.service.PremiumPlusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/premium-plus")
@RequiredArgsConstructor
public class PremiumPlusController {
  private final PremiumPlusService service;

  @GetMapping("/boost")
  PremiumPlusService.BoostStatus boostStatus() {
    return service.boostStatus();
  }

  @PostMapping("/boost")
  PremiumPlusService.BoostStatus activateBoost() {
    return service.activateBoost();
  }
}
