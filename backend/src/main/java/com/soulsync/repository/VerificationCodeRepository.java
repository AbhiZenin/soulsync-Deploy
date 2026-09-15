package com.soulsync.repository;

import com.soulsync.domain.VerificationCode;
import com.soulsync.domain.Enums.VerificationPurpose;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, UUID> {
  Optional<VerificationCode> findTopByUserIdAndPurposeOrderByCreatedAtDesc(UUID userId, VerificationPurpose purpose);
  Optional<VerificationCode> findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(UUID userId, VerificationPurpose purpose);

  @Modifying(clearAutomatically=true, flushAutomatically=true)
  @Query("update VerificationCode v set v.used=true where v.user.id=:userId and v.purpose=:purpose and v.used=false")
  int invalidateActive(@Param("userId") UUID userId, @Param("purpose") VerificationPurpose purpose);
}
