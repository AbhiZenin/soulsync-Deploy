package com.soulsync.web;

import com.soulsync.service.SubscriptionAccessService;
import com.soulsync.service.ProfileService; import com.soulsync.web.dto.ProfileDtos.*; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.Page; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class ProfileController {
  private final SubscriptionAccessService subscriptionAccess; private final ProfileService service;
 @GetMapping("/profile/me") ProfileDetail me(){return service.me();}
 @PutMapping("/profile/me") ProfileDetail update(@Valid @RequestBody ProfileUpdate r){return service.update(r);}
 @GetMapping("/profiles/{userId}") ProfileDetail get(@PathVariable UUID userId){return service.get(userId);}
 @GetMapping("/profiles") Page<ProfileCard> search(@RequestParam(required=false) Integer minAge,@RequestParam(required=false) Integer maxAge,@RequestParam(required=false) String gender,@RequestParam(required=false) String country,@RequestParam(required=false) String state,@RequestParam(required=false) String city,@RequestParam(required=false) String religion,@RequestParam(required=false) String motherTongue,@RequestParam(required=false) String education,@RequestParam(required=false) String occupation,@RequestParam(required=false) Integer minHeightCm,@RequestParam(required=false) Integer maxHeightCm,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
    boolean usesAdvancedSearch =
        (religion != null && !religion.isBlank())
        || (motherTongue != null && !motherTongue.isBlank())
        || (education != null && !education.isBlank())
        || (occupation != null && !occupation.isBlank())
        || minHeightCm != null
        || maxHeightCm != null;

    if (usesAdvancedSearch) {
      subscriptionAccess.require(
          "ADVANCED_SEARCH",
          "Advanced search filters are available on Premium and Premium Plus."
      );
    }
return service.search(new SearchFilter(minAge,maxAge,gender,country,state,city,religion,motherTongue,education,occupation,minHeightCm,maxHeightCm),page,size);}
 @GetMapping("/matches") List<ProfileCard> matches(){return service.recommendations();}
 @GetMapping("/preferences") PreferenceDto preference(){return service.preference();}
 @PutMapping("/preferences") PreferenceDto preference(@Valid @RequestBody PreferenceUpdate r){return service.updatePreference(r);}
}
