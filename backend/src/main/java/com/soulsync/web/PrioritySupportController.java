package com.soulsync.web;

import com.soulsync.service.PrioritySupportService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/premium-plus/support")
@RequiredArgsConstructor
public class PrioritySupportController {
  private final PrioritySupportService service;

  record CreateTicketRequest(
      @NotBlank @Size(min = 3, max = 200) String subject,
      @NotBlank @Size(min = 10, max = 5000) String message
  ) {}

  @GetMapping
  List<PrioritySupportService.TicketDto> mine() {
    return service.mine();
  }

  @PostMapping
  PrioritySupportService.TicketDto create(
      @Valid @RequestBody CreateTicketRequest request
  ) {
    return service.create(request.subject(), request.message());
  }
}
