package com.soulsync.repository;
import com.soulsync.domain.RefreshToken; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.time.Instant; import java.util.*;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> { Optional<RefreshToken> findByTokenHash(String tokenHash); @Modifying @Query("update RefreshToken r set r.revoked=true where r.user.id=:userId and r.revoked=false") int revokeAllForUser(@Param("userId") UUID userId); void deleteByExpiresAtBefore(Instant now); }
