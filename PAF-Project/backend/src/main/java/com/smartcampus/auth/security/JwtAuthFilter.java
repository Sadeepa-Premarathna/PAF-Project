package com.smartcampus.auth.security;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AppUserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); return;
        }
        String token = authHeader.substring(7);
        if (!jwtService.validateToken(token)) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response); return;
        }
        String subject = jwtService.extractSubject(token);
        List<String> roles = jwtService.extractRoles(token);
        AppUser user = userRepository.findById(UUID.fromString(subject)).orElse(null);
        if (user != null && user.isActive()) {
            var authorities = roles.stream().map(SimpleGrantedAuthority::new).toList();
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(user, null, authorities));
        }
        filterChain.doFilter(request, response);
    }
}
