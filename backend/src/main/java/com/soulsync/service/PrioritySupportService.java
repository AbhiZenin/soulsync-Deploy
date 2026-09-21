package com.soulsync.service;

import com.soulsync.domain.PrioritySupportTicket;
import com.soulsync.exception.BadRequestException;
import com.soulsync.exception.NotFoundException;
import com.soulsync.repository.PrioritySupportTicketRepository;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrioritySupportService {
  private final PrioritySupportTicketRepository tickets;
  private final CurrentUser current;
  private final SubscriptionAccessService subscriptionAccess;

  public record TicketDto(
      UUID id,
      UUID userId,
      String subject,
      String message,
      String status,
      Instant createdAt,
      Instant updatedAt
  ) {}

  @Transactional
  public TicketDto create(String subject, String message) {
    subscriptionAccess.require(
        "PRIORITY_SUPPORT",
        "Priority support is available on Premium Plus."
    );

    String cleanSubject = clean(subject);
    String cleanMessage = clean(message);

    if (cleanSubject == null || cleanSubject.length() < 3) {
      throw new BadRequestException("Support subject must be at least 3 characters.");
    }
    if (cleanSubject.length() > 200) {
      throw new BadRequestException("Support subject must be 200 characters or fewer.");
    }
    if (cleanMessage == null || cleanMessage.length() < 10) {
      throw new BadRequestException("Support message must be at least 10 characters.");
    }

    var ticket = tickets.save(
        PrioritySupportTicket.builder()
            .user(current.entity())
            .subject(cleanSubject)
            .message(cleanMessage)
            .status("OPEN")
            .build()
    );
    return dto(ticket);
  }

  @Transactional(readOnly = true)
  public List<TicketDto> mine() {
    subscriptionAccess.require(
        "PRIORITY_SUPPORT",
        "Priority support is available on Premium Plus."
    );
    return tickets.findByUserIdOrderByCreatedAtDesc(current.id())
        .stream().map(this::dto).toList();
  }

  @Transactional(readOnly = true)
  public List<TicketDto> allForAdmin() {
    return tickets.findAllByOrderByCreatedAtDesc()
        .stream().map(this::dto).toList();
  }

  @Transactional
  public TicketDto updateStatus(UUID id, String requestedStatus) {
    String status = clean(requestedStatus) == null
        ? ""
        : requestedStatus.trim().toUpperCase(Locale.ROOT);

    if (!List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED").contains(status)) {
      throw new BadRequestException("Invalid support ticket status.");
    }

    var ticket = tickets.findById(id)
        .orElseThrow(() -> new NotFoundException("Support ticket not found"));
    ticket.setStatus(status);
    return dto(ticket);
  }

  private TicketDto dto(PrioritySupportTicket t) {
    return new TicketDto(
        t.getId(),
        t.getUser().getId(),
        t.getSubject(),
        t.getMessage(),
        t.getStatus(),
        t.getCreatedAt(),
        t.getUpdatedAt()
    );
  }

  private static String clean(String value) {
    if (value == null) return null;
    String result = value.trim();
    return result.isEmpty() ? null : result;
  }
}
