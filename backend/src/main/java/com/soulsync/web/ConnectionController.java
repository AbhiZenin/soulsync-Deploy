package com.soulsync.web;
import com.soulsync.service.ConnectionService; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class ConnectionController { private final ConnectionService service;
 @PostMapping("/interests/{targetId}") ResponseEntity<ConnectionService.InterestDto> send(@PathVariable UUID targetId){return ResponseEntity.status(HttpStatus.CREATED).body(service.send(targetId));}
 @GetMapping("/interests/sent") List<ConnectionService.InterestDto> sent(){return service.sent();} @GetMapping("/interests/received") List<ConnectionService.InterestDto> received(){return service.received();}
 @PatchMapping("/interests/{id}/accept") ConnectionService.InterestDto accept(@PathVariable UUID id){return service.respond(id,true);} @PatchMapping("/interests/{id}/decline") ConnectionService.InterestDto decline(@PathVariable UUID id){return service.respond(id,false);} @PatchMapping("/interests/{id}/withdraw") ConnectionService.InterestDto withdraw(@PathVariable UUID id){return service.withdraw(id);}
 @PostMapping("/shortlist/{targetId}") ConnectionService.ShortlistDto shortlist(@PathVariable UUID targetId){return service.shortlist(targetId);} @DeleteMapping("/shortlist/{targetId}") ResponseEntity<Void> unshortlist(@PathVariable UUID targetId){service.unshortlist(targetId);return ResponseEntity.noContent().build();} @GetMapping("/shortlist") List<ConnectionService.ShortlistDto> shortlist(){return service.shortlist();}
}
