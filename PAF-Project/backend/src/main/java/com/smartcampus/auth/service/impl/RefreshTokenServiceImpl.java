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

    private static final long EXPIRY_SECONDS = 604_800L;
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public RefreshToken save(AppUser user, String rawToken) {
        return refreshTokenRepository.save(RefreshToken.builder()
                .user(user).tokenHash(sha256(rawToken))
                .expiresAt(Instant.now().plusSeconds(EXPIRY_SECONDS)).revoked(false).build());
    }

    @Override
    @Transactional
    public RefreshToken validate(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(sha256(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        if (stored.isRevoked()) {
            revokeAllForUser(stored.getUser());
            throw new UnauthorizedException("Refresh token reuse detected");
        }
        if (stored.getExpiresAt().isBefore(Instant.now()))
            throw new UnauthorizedException("Refresh token expired");
        return stored;
    }

    @Override
    @Transactional
    public RefreshToken rotate(String oldRawToken, AppUser user, String newRawToken) {
        refreshTokenRepository.findByTokenHash(sha256(oldRawToken)).ifPresent(t -> {
            t.setRevoked(true); refreshTokenRepository.save(t);
        });
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
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) { throw new RuntimeException(e); }
    }
}
