package com.soulsync.web;

import com.soulsync.service.VideoCallService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/premium-plus/video-calls")
@RequiredArgsConstructor
public class VideoCallController {
  private final VideoCallService service;

  @PostMapping("/{targetId}")
  VideoCallService.VideoCallDto create(@PathVariable UUID targetId) {
    return service.create(targetId);
  }

  @GetMapping("/{id}")
  VideoCallService.VideoCallDto get(@PathVariable UUID id) {
    return service.get(id);
  }
}
