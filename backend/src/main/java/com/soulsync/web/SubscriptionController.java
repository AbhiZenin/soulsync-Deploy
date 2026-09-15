package com.soulsync.web;
import com.soulsync.domain.Enums.Plan; import jakarta.validation.Valid; import com.soulsync.service.SubscriptionService; import jakarta.validation.constraints.NotNull; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/subscriptions") @RequiredArgsConstructor
public class SubscriptionController { private final SubscriptionService service; record PlanRequest(@NotNull Plan plan){}
 @GetMapping("/me") SubscriptionService.SubscriptionDto mine(){return service.mine();}
 @PostMapping("/checkout") SubscriptionService.CheckoutDto checkout(@Valid @RequestBody PlanRequest r){return service.checkout(r.plan());}
 @PostMapping("/dev-plan") SubscriptionService.SubscriptionDto dev(@Valid @RequestBody PlanRequest r){return service.devSet(r.plan());}
 @PostMapping("/webhook") ResponseEntity<Void> webhook(@RequestBody String payload,@RequestHeader("Stripe-Signature") String sig){service.webhook(payload,sig);return ResponseEntity.ok().build();}
}
