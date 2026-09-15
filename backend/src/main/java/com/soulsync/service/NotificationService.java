package com.soulsync.service;
import com.soulsync.domain.Notification; import com.soulsync.exception.NotFoundException; import com.soulsync.repository.NotificationRepository; import com.soulsync.security.CurrentUser; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service @RequiredArgsConstructor
public class NotificationService { private final NotificationRepository repo; private final CurrentUser current;
 public record NotificationDto(UUID id,String type,String title,String body,boolean read,java.time.Instant createdAt){}
 @Transactional(readOnly=true) public List<NotificationDto> list(){return repo.findTop50ByUserIdOrderByCreatedAtDesc(current.id()).stream().map(this::dto).toList();}
 @Transactional(readOnly=true) public long unread(){return repo.countByUserIdAndReadFalse(current.id());}
 @Transactional public NotificationDto read(UUID id){var n=repo.findByIdAndUserId(id,current.id()).orElseThrow(()->new NotFoundException("Notification not found"));n.setRead(true);return dto(n);} @Transactional public void readAll(){repo.findTop50ByUserIdOrderByCreatedAtDesc(current.id()).forEach(n->n.setRead(true));}
 private NotificationDto dto(Notification n){return new NotificationDto(n.getId(),n.getType().name(),n.getTitle(),n.getBody(),n.isRead(),n.getCreatedAt());}
}
