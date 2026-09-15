package com.soulsync.repository;
import com.soulsync.domain.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmailIgnoreCase(String email);
  boolean existsByEmailIgnoreCase(String email);
  Optional<User> findByPhoneNumber(String phoneNumber);
  boolean existsByPhoneNumber(String phoneNumber);
}
