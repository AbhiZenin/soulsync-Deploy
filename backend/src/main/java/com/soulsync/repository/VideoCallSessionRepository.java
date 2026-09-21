package com.soulsync.repository;

import com.soulsync.domain.VideoCallSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface VideoCallSessionRepository
    extends JpaRepository<VideoCallSession, UUID> {
}
