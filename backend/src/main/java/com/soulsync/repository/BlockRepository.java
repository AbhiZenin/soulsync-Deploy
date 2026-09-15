package com.soulsync.repository;
import com.soulsync.domain.Block; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface BlockRepository extends JpaRepository<Block, UUID> { boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId); Optional<Block> findByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId); List<Block> findByBlockerId(UUID blockerId); List<Block> findByBlockedId(UUID blockedId); }
