package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.*;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.exception.AccountDisabledException;
import com.smartcampus.auth.exception.UnauthorizedException;
import com.smartcampus.auth.service.GoogleOAuthClient;
import com.smartcampus.auth.service.JwtService;
import com.smartcampus.auth.service.RefreshTokenService;
import com.smartcampus.auth.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

    private final GoogleOAuthClient googleOAuthClient;
    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/callback")
    public ResponseEntity<AuthResponse> handleOAuthCallback(
            @Valid @RequestBody OAuthCallbackRequest request, HttpServletResponse response) {
        OAuth2UserInfo userInfo = googleOAuthClient.exchangeCodeAndGetUserInfo(request.getCode(), request.getRedirectUri());
        AppUser user = userService.findOrCreateUser(userInfo);
        if (!user.isActive()) throw new AccountDisabledException("Account is deactivated");
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = jwtService.generateRefreshToken(user);
        refreshTokenService.save(user, rawRefreshToken);
        setRefreshTokenCookie(response, rawRefreshToken);
        return ResponseEntity.ok(AuthResponse.builder().accessToken(accessToken)
                .tokenType("Bearer").expiresIn(900).user(UserResponse.from(user)).build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawRefreshToken = extractRefreshTokenCookie(request);
        RefreshToken validated = refreshTokenService.validate(rawRefreshToken);
        AppUser user = validated.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRawRefreshToken = jwtService.generateRefreshToken(user);
        refreshTokenService.rotate(rawRefreshToken, user, newRawRefreshToken);
        setRefreshTokenCookie(response, newRawRefreshToken);
        return ResponseEntity.ok(TokenResponse.builder().accessToken(newAccessToken).tokenType("Bearer").expiresIn(900).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            String rawRefreshToken = extractRefreshTokenCookie(request);
            RefreshToken token = refreshTokenService.validate(rawRefreshToken);
            refreshTokenService.revokeAllForUser(token.getUser());
        } catch (Exception ignored) {}
        clearRefreshTokenCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        AppUser user = (AppUser) authentication.getPrincipal();
        return ResponseEntity.ok(UserResponse.from(user));
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String rawToken) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, rawToken);
        cookie.setHttpOnly(true); cookie.setSecure(false);
        cookie.setPath("/api/auth"); cookie.setMaxAge(REFRESH_TOKEN_MAX_AGE);
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, "");
        cookie.setHttpOnly(true); cookie.setPath("/api/auth"); cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshTokenCookie(HttpServletRequest request) {
        if (request.getCookies() == null) throw new UnauthorizedException("No refresh token cookie");
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_TOKEN_COOKIE.equals(c.getName())).map(Cookie::getValue)
                .findFirst().orElseThrow(() -> new UnauthorizedException("Refresh token cookie not found"));
    }
}
