package com.soulsync.service;

import com.soulsync.domain.Interest;
import com.soulsync.domain.Enums.InterestStatus;
import com.soulsync.domain.Enums.Plan;
import com.soulsync.exception.ForbiddenException;
import com.soulsync.repository.SubscriptionRepository;
import com.soulsync.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionAccessService {

    private final SubscriptionRepository subscriptions;
    private final CurrentUser current;

    @Value("${soulsync.subscription.free-pending-interest-limit:10}")
    private int freePendingInterestLimit;

    @Transactional(readOnly = true)
    public Plan currentPlan() {
        return subscriptions
                .findByUserId(current.id())
                .map(subscription -> subscription.getPlan())
                .orElse(Plan.FREE);
    }

    @Transactional(readOnly = true)
    public boolean has(String entitlement) {
        Plan plan = currentPlan();

        return switch (entitlement) {
            case "SEND_INTEREST", "BASIC_SEARCH", "MESSAGE_CONNECTIONS" -> true;

            case "UNLIMITED_INTERESTS",
                 "ADVANCED_SEARCH",
                 "VIEW_PROFILE_VISITORS",
                 "VIEW_CONTACT",
                 "ENHANCED_DISCOVERY" -> plan != Plan.FREE;

            case "PROFILE_BOOST",
                 "VIDEO_CALL",
                 "PRIORITY_SUPPORT" -> plan == Plan.PREMIUM_PLUS;

            default -> false;
        };
    }

    public void require(String entitlement, String message) {
        if (!has(entitlement)) {
            throw new ForbiddenException(message);
        }
    }

    public void checkInterestAllowance(List<Interest> sentInterests) {
        if (has("UNLIMITED_INTERESTS")) {
            return;
        }

        int limit = Math.max(1, freePendingInterestLimit);

        long pendingCount = sentInterests.stream()
                .filter(interest ->
                        interest.getStatus() == InterestStatus.PENDING)
                .count();

        if (pendingCount >= limit) {
            throw new ForbiddenException(
                    "Your Free plan allows up to "
                            + limit
                            + " pending interests at a time. "
                            + "Withdraw an existing pending interest or upgrade "
                            + "to Premium for unlimited interests."
            );
        }
    }
}
