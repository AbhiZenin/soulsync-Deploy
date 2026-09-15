package com.soulsync.repository;
import com.soulsync.domain.Notification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification, UUID> { List<Notification> findTop50ByUserIdOrderByCreatedAtDesc(UUID userId); Optional<Notification> findByIdAndUserId(UUID id, UUID userId); long countByUserIdAndReadFalse(UUID userId); }
