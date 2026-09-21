package com.soulsync.repository;

import com.soulsync.domain.PrioritySupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PrioritySupportTicketRepository
    extends JpaRepository<PrioritySupportTicket, UUID> {
  List<PrioritySupportTicket> findByUserIdOrderByCreatedAtDesc(UUID userId);
  List<PrioritySupportTicket> findAllByOrderByCreatedAtDesc();
}
