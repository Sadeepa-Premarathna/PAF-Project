package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.AppUser;

import java.util.Date;
import java.util.List;

/**
 * Service for generating, validating, and parsing JSON Web Tokens (JWTs).
 *
 * <p>Access tokens are short-lived (15 minutes) and carry user identity and role claims.
 * Refresh tokens are long-lived (7 days) and carry only the subject claim.</p>
 */
public interface JwtService {

    String generateAccessToken(AppUser user);

    String generateRefreshToken(AppUser user);

    boolean validateToken(String token);

    String extractSubject(String token);

    List<String> extractRoles(String token);

    Date extractExpiry(String token);
}
