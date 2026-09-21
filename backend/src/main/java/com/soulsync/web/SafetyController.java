package com.soulsync.web;

import com.soulsync.service.SubscriptionAccessService;
import com.soulsync.service.SafetyService; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class SafetyController {
  private final SubscriptionAccessService subscriptionAccess; private final SafetyService service; public record ReportRequest(@NotBlank @Size(max=200)String reason,@Size(max=2000)String details){}
 @PostMapping("/blocks/{targetId}") SafetyService.BlockDto block(@PathVariable UUID targetId){return service.block(targetId);}@DeleteMapping("/blocks/{targetId}")ResponseEntity<Void>unblock(@PathVariable UUID targetId){service.unblock(targetId);return ResponseEntity.noContent().build();}@GetMapping("/blocks")List<SafetyService.BlockDto>blocks(){return service.blocked();}
 @PostMapping("/reports/{targetId}")ResponseEntity<SafetyService.ReportDto>report(@PathVariable UUID targetId,@Valid @RequestBody ReportRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.report(targetId,r.reason(),r.details()));}@GetMapping("/profile-viewers")List<SafetyService.ViewDto>viewers(){
    subscriptionAccess.require(
        "VIEW_PROFILE_VISITORS",
        "Profile visitors are available on Premium and Premium Plus."
    );
return service.viewers();}
}
