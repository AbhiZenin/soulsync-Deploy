package com.soulsync.repository;
import com.soulsync.domain.Shortlist; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ShortlistRepository extends JpaRepository<Shortlist, UUID> { List<Shortlist> findByUserIdOrderByCreatedAtDesc(UUID userId); Optional<Shortlist> findByUserIdAndTargetUserId(UUID userId, UUID targetUserId); }
