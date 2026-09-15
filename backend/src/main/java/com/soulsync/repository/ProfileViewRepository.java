package com.soulsync.repository;
import com.soulsync.domain.ProfileView; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ProfileViewRepository extends JpaRepository<ProfileView, UUID> { List<ProfileView> findTop50ByViewedIdOrderByViewedAtDesc(UUID viewedId); }
