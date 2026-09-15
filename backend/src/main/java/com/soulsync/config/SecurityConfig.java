package com.soulsync.config;

import com.soulsync.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration @EnableMethodSecurity @RequiredArgsConstructor
public class SecurityConfig {
  private final JwtAuthenticationFilter jwtFilter; private final RateLimitFilter rateLimitFilter;
  @Bean PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(12); }
  @Bean CorsConfigurationSource cors(@Value("${soulsync.frontend-url}") String frontend,
                                       @Value("${soulsync.dev-mode}") boolean devMode){
    var c=new CorsConfiguration();
    var origins=new java.util.ArrayList<String>();
    origins.add(frontend);
    if(devMode){
      origins.add("http://localhost:3000");
      origins.add("http://127.0.0.1:3000");
    }
    c.setAllowedOrigins(origins.stream().distinct().toList());
    c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization","Content-Type"));
    c.setAllowCredentials(true);
    var s=new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**",c);
    return s;
  }
  @Bean SecurityFilterChain chain(HttpSecurity http)throws Exception{
    return http.csrf(csrf->csrf.disable()).cors(c->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(a->a.requestMatchers("/api/v1/auth/**","/api/v1/subscriptions/webhook","/actuator/health/**","/ws/**").permitAll().requestMatchers(HttpMethod.GET,"/api/v1/public/**").permitAll().requestMatchers("/api/v1/admin/**").hasRole("ADMIN").anyRequest().authenticated())
      .addFilterBefore(rateLimitFilter,UsernamePasswordAuthenticationFilter.class).addFilterBefore(jwtFilter,UsernamePasswordAuthenticationFilter.class).build();
  }
}
