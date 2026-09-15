package com.soulsync.repository;
import com.soulsync.domain.ProfilePhoto; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ProfilePhotoRepository extends JpaRepository<ProfilePhoto, UUID> { List<ProfilePhoto> findByUserIdOrderBySortOrderAsc(UUID userId); Optional<ProfilePhoto> findByIdAndUserId(UUID id, UUID userId); }
