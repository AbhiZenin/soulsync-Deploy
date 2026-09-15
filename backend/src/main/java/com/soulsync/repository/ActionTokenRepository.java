package com.soulsync.repository;
import com.soulsync.domain.ActionToken; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ActionTokenRepository extends JpaRepository<ActionToken, UUID> { Optional<ActionToken> findByTokenHashAndPurpose(String tokenHash, String purpose); }
