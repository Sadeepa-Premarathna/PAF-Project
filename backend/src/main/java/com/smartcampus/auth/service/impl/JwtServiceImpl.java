package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.service.JwtService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtServiceImpl implements JwtService {

    private static final long ACCESS_TOKEN_EXPIRY_MS = 900L * 1000;
    private static final long REFRESH_TOKEN_EXPIRY_MS = 604_800L * 1000;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key signingKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("jwt.secret must be at least 32 characters long");
        }
        signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    @Override
    public String generateAccessToken(AppUser user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MS);
        return Jwts.builder()
                .setId(java.util.UUID.randomUUID().toString())
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", List.of("ROLE_" + user.getRole().name()))
                .setIssuedAt(now).setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256).compact();
    }

    @Override
    public String generateRefreshToken(AppUser user) {
        Date now = new Date();
        return Jwts.builder()
                .setId(java.util.UUID.randomUUID().toString())
                .setSubject(user.getId().toString())
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_MS))
                .signWith(signingKey, SignatureAlgorithm.HS256).compact();
    }

    @Override
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) return false;
        try {
            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) { return false; }
    }

    @Override
    public String extractSubject(String token) { return parseClaims(token).getSubject(); }

    @Override
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) { return (List<String>) parseClaims(token).get("roles"); }

    @Override
    public Date extractExpiry(String token) { return parseClaims(token).getExpiration(); }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token).getBody();
    }
}
