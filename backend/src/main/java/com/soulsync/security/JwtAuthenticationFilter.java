package com.soulsync.security;

import com.soulsync.domain.Enums.UserStatus;
import com.soulsync.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*; import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.*;

@Component @RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwt; private final UserRepository users;
  @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
    String h=req.getHeader("Authorization");
    if(h!=null&&h.startsWith("Bearer ")&&SecurityContextHolder.getContext().getAuthentication()==null){
      try{
        var claims=jwt.parse(h.substring(7)); UUID id=UUID.fromString(claims.getSubject());
        users.findById(id).filter(u->u.getStatus()==UserStatus.ACTIVE).ifPresent(u->{ var auth=new UsernamePasswordAuthenticationToken(id.toString(),null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name()))); SecurityContextHolder.getContext().setAuthentication(auth); });
      }catch(JwtException|IllegalArgumentException ignored){}
    }
    chain.doFilter(req,res);
  }
}
