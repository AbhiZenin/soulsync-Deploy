package com.soulsync.web;

import com.soulsync.service.PrioritySupportService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/support-tickets")
@RequiredArgsConstructor
public class AdminPrioritySupportController {
  private final PrioritySupportService service;

  record StatusRequest(@NotBlank String status) {}

  @GetMapping
  List<PrioritySupportService.TicketDto> all() {
    return service.allForAdmin();
  }

  @PatchMapping("/{id}/status")
  PrioritySupportService.TicketDto status(
      @PathVariable UUID id,
      @Valid @RequestBody StatusRequest request
  ) {
    return service.updateStatus(id, request.status());
  }
}
