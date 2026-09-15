package com.soulsync.repository;
import com.soulsync.domain.Profile; import org.springframework.data.jpa.repository.*; import java.util.*;
public interface ProfileRepository extends JpaRepository<Profile, UUID>, JpaSpecificationExecutor<Profile> { Optional<Profile> findByUserId(UUID userId); }
