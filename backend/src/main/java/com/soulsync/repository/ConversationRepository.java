package com.soulsync.repository;
import com.soulsync.domain.Conversation; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.util.*;
public interface ConversationRepository extends JpaRepository<Conversation, UUID> { @Query("select c from Conversation c where c.user1.id=:uid or c.user2.id=:uid order by c.updatedAt desc") List<Conversation> findForUser(@Param("uid") UUID uid); Optional<Conversation> findByUser1IdAndUser2Id(UUID user1Id, UUID user2Id); }
