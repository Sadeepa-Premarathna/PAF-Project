package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.exception.UnauthorizedException;
import com.smartcampus.auth.repository.RefreshTokenRepository;
import com.smartcampus.auth.service.impl.RefreshTokenServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = AppUser.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .role(Role.USER)
                .active(true)
                .build();
    }

    @Test
    void validate_revokedToken_shouldRevokeAllAndThrow() {
        String rawToken = "some-raw-token";
        RefreshToken revoked = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(sha256(rawToken))
                .expiresAt(Instant.now().plusSeconds(3600))
                .revoked(true)
                .build();

        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(revoked));
        when(refreshTokenRepository.findAllByUserAndRevokedFalse(user)).thenReturn(List.of());

        assertThatThrownBy(() -> refreshTokenService.validate(rawToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("reuse detected");
    }

    @Test
    void validate_expiredToken_shouldThrow() {
        String rawToken = "expired-token";
        RefreshToken expired = RefreshToken.builder()
                .id(UUID.randomUUID())
                .user(user)
                .tokenHash(sha256(rawToken))
                .expiresAt(Instant.now().minusSeconds(1))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> refreshTokenService.validate(rawToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void validate_notFoundToken_shouldThrow() {
        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.validate("unknown-token"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("not found");
    }

    private String sha256(String input) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
