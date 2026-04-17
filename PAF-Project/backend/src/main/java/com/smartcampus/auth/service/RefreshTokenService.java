package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.RefreshToken;

public interface RefreshTokenService {
    RefreshToken save(AppUser user, String rawToken);
    RefreshToken validate(String rawToken);
    RefreshToken rotate(String oldRawToken, AppUser user, String newRawToken);
    void revokeAllForUser(AppUser user);
}
