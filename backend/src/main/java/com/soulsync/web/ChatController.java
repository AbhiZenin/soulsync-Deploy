package com.soulsync.web;
import com.soulsync.service.ChatService; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1/conversations") @RequiredArgsConstructor
public class ChatController { private final ChatService service; public record SendMessageRequest(@NotBlank @Size(max=4000) String body){}
 @PostMapping("/with/{targetId}") ChatService.ConversationDto open(@PathVariable UUID targetId){return service.open(targetId);} @GetMapping List<ChatService.ConversationDto> list(){return service.list();}
 @GetMapping("/{id}/messages") List<ChatService.MessageDto> messages(@PathVariable UUID id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="50")int size){return service.messages(id,page,size);} @PostMapping("/{id}/messages") ResponseEntity<ChatService.MessageDto> send(@PathVariable UUID id,@Valid @RequestBody SendMessageRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.send(id,r.body()));} @PatchMapping("/{id}/read") ResponseEntity<Void> read(@PathVariable UUID id){service.markRead(id);return ResponseEntity.noContent().build();}
}
