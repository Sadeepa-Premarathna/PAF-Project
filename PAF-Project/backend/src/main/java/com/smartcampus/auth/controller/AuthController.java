package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.*;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.exception.AccountDisabledException;
import com.smartcampus.auth.exception.DuplicateEmailException;
import com.smartcampus.auth.exception.InvalidCredentialsException;
import com.smartcampus.auth.exception.UnauthorizedException;
import com.smartcampus.auth.service.GoogleOAuthClient;
import com.smartcampus.auth.service.JwtService;
import com.smartcampus.auth.service.PasswordService;
import com.smartcampus.auth.service.RefreshTokenService;
import com.smartcampus.auth.service.StudentIdValidator;
import com.smartcampus.auth.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@Slf4j
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
    private final PasswordService passwordService;
    private final StudentIdValidator studentIdValidator;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse response) {
        log.info("Register attempt: email={}, studentId={}, googleSub={}", req.getEmail(), req.getStudentId(), req.getGoogleSub());
        // Only validate password strength for non-OAuth registrations
        if (req.getGoogleSub() == null) {
            List<String> passwordErrors = passwordService.validateStrength(req.getPassword());
            if (!passwordErrors.isEmpty()) {
                log.warn("Password validation failed for email={}: {}", req.getEmail(), passwordErrors);
                return ResponseEntity.badRequest().body(java.util.Map.of(
                        "status", 400, "error", "Bad Request",
                        "message", "Validation failed", "errors", passwordErrors));
            }
        }
        String studentIdError = studentIdValidator.validate(req.getStudentId());
        if (studentIdError != null) {
            log.warn("Student ID validation failed: {}", studentIdError);
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "status", 400, "error", "Bad Request",
                    "message", studentIdError));
        }
        if (userService.existsByEmail(req.getEmail())) {
            log.warn("Duplicate email: {}", req.getEmail());
            throw new DuplicateEmailException("Email is already registered");
        }
        if (req.getGoogleSub() != null && userService.findByGoogleSub(req.getGoogleSub()).isPresent()) {
            log.warn("Duplicate googleSub: {}", req.getGoogleSub());
            throw new DuplicateEmailException("This Google account is already linked to an existing profile.");
        }
        try {
            AppUser user = req.getGoogleSub() != null
                    ? userService.createOAuthUser(req)
                    : userService.createPasswordUser(req);
            log.info("User created successfully: id={}, email={}", user.getId(), user.getEmail());
            return ResponseEntity.ok(issueTokens(user, response));
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        AppUser user = userService.findByEmail(req.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));
        if (!passwordService.matches(req.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
        if (!user.isActive()) {
            throw new AccountDisabledException("Account is deactivated");
        }
        return ResponseEntity.ok(issueTokens(user, response));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleOAuthCallback(
            @Valid @RequestBody OAuthCallbackRequest request, HttpServletResponse response) {
        log.info("OAuth callback received. redirectUri={}", request.getRedirectUri());
        try {
            OAuth2UserInfo userInfo = googleOAuthClient.exchangeCodeAndGetUserInfo(request.getCode(), request.getRedirectUri());
            return userService.findByGoogleSub(userInfo.getSub())
                    .map(user -> {
                        if (!user.isActive()) throw new AccountDisabledException("Account is deactivated");
                        return ResponseEntity.ok().body((Object) issueTokens(user, response));
                    })
                    .orElseGet(() -> ResponseEntity.status(202).body(
                            new ProfileCompletionResponse(userInfo.getName(), userInfo.getEmail(), userInfo.getSub())));
        } catch (Exception e) {
            log.error("OAuth callback error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
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

    private AuthResponse issueTokens(AppUser user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = jwtService.generateRefreshToken(user);
        refreshTokenService.save(user, rawRefreshToken);
        setRefreshTokenCookie(response, rawRefreshToken);
        return AuthResponse.builder().accessToken(accessToken)
                .tokenType("Bearer").expiresIn(900).user(UserResponse.from(user)).build();
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
