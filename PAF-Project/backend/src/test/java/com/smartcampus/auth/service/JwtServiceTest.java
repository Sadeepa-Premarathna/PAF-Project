package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.service.impl.JwtServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtServiceImpl jwtService;

    private AppUser testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl();
        ReflectionTestUtils.setField(jwtService, "jwtSecret",
                "test-secret-key-that-is-at-least-32-chars-long!");
        jwtService.init();

        testUser = AppUser.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .name("Test User")
                .role(Role.USER)
                .active(true)
                .build();
    }

    @Test
    void generateAccessToken_shouldReturnValidToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void validateToken_withValidToken_shouldReturnTrue() {
        String token = jwtService.generateAccessToken(testUser);
        assertThat(jwtService.validateToken(token)).isTrue();
    }

    @Test
    void validateToken_withNullToken_shouldReturnFalse() {
        assertThat(jwtService.validateToken(null)).isFalse();
    }

    @Test
    void validateToken_withTamperedToken_shouldReturnFalse() {
        String token = jwtService.generateAccessToken(testUser);
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertThat(jwtService.validateToken(tampered)).isFalse();
    }

    @Test
    void extractSubject_shouldReturnUserId() {
        String token = jwtService.generateAccessToken(testUser);
        String subject = jwtService.extractSubject(token);
        assertThat(subject).isEqualTo(testUser.getId().toString());
    }

    @Test
    void extractRoles_shouldReturnRoleWithPrefix() {
        String token = jwtService.generateAccessToken(testUser);
        List<String> roles = jwtService.extractRoles(token);
        assertThat(roles).containsExactly("ROLE_USER");
    }

    @Test
    void generateRefreshToken_shouldReturnValidToken() {
        String token = jwtService.generateRefreshToken(testUser);
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.extractSubject(token)).isEqualTo(testUser.getId().toString());
    }
}
