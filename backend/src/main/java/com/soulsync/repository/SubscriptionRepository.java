package com.soulsync.repository;
import com.soulsync.domain.Subscription; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> { Optional<Subscription> findByUserId(UUID userId); }
