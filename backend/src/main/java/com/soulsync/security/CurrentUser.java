package com.soulsync.security;
import com.soulsync.domain.User; import com.soulsync.exception.NotFoundException; import com.soulsync.repository.UserRepository; import lombok.RequiredArgsConstructor; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Component; import java.util.UUID;
@Component @RequiredArgsConstructor
public class CurrentUser { private final UserRepository users; public UUID id(){ var a=SecurityContextHolder.getContext().getAuthentication(); if(a==null||!a.isAuthenticated()) throw new NotFoundException("Authenticated user not found"); return UUID.fromString(a.getName()); } public User entity(){ return users.findById(id()).orElseThrow(()->new NotFoundException("User not found")); } }
