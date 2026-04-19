package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.AppUser;
import java.util.Date;
import java.util.List;

public interface JwtService {
    String generateAccessToken(AppUser user);
    String generateRefreshToken(AppUser user);
    boolean validateToken(String token);
    String extractSubject(String token);
    List<String> extractRoles(String token);
    Date extractExpiry(String token);
}
