package com.soulsync.repository;
import com.soulsync.domain.PartnerPreference; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface PartnerPreferenceRepository extends JpaRepository<PartnerPreference, UUID> { Optional<PartnerPreference> findByUserId(UUID userId); }
