package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.exception.UnauthorizedException;
import com.smartcampus.auth.repository.RefreshTokenRepository;
import com.smartcampus.auth.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final long REFRESH_TOKEN_EXPIRY_SECONDS = 604_800L; // 7 days

    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public RefreshToken save(AppUser user, String rawToken) {
        String hash = sha256(rawToken);
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(Instant.now().plusSeconds(REFRESH_TOKEN_EXPIRY_SECONDS))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public RefreshToken validate(String rawToken) {
        String hash = sha256(rawToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (stored.isRevoked()) {
            // Reuse detected — revoke all tokens for this user
            revokeAllForUser(stored.getUser());
            throw new UnauthorizedException("Refresh token reuse detected");
        }

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }

        return stored;
    }

    @Override
    @Transactional
    public RefreshToken rotate(String oldRawToken, AppUser user, String newRawToken) {
        // Revoke old token
        String oldHash = sha256(oldRawToken);
        refreshTokenRepository.findByTokenHash(oldHash).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
        // Persist new token
        return save(user, newRawToken);
    }

    @Override
    @Transactional
    public void revokeAllForUser(AppUser user) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUserAndRevokedFalse(user);
        tokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
