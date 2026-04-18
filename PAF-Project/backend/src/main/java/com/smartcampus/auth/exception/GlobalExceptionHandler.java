package com.smartcampus.auth.exception;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OAuthException.class)
    public ResponseEntity<Map<String, Object>> handleOAuth(OAuthException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "error", "Bad Request",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", 401,
                "error", "Unauthorized",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<Map<String, Object>> handleDisabled(AccountDisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403,
                "error", "Forbidden",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateEmail(DuplicateEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "status", 409,
                "error", "Conflict",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "status", 401,
                "error", "Unauthorized",
                "message", "Invalid credentials"));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<Map<String, Object>> handleRateLimit(RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                "status", 429,
                "error", "Too Many Requests",
                "message", "Too many registration attempts. Try again later."));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403,
                "error", "Forbidden",
                "message", "Insufficient permissions"));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.toList());
        return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "error", "Bad Request",
                "message", "Validation failed",
                "errors", errors));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException ex) {
        String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        System.out.println("========== DATA INTEGRITY EXCEPTION ==========");
        System.out.println("rootMsg: " + rootMsg);
        System.out.println("==============================================");
        String msg = "Data Integrity Error: " + rootMsg;

        if (rootMsg != null) {
            String lowerMsg = rootMsg.toLowerCase();
            boolean isDuplicate = lowerMsg.contains("duplicate entry") || lowerMsg.contains("unique constraint");
            
            if (isDuplicate) {
                if (lowerMsg.contains("student_id") || lowerMsg.contains("studentid") || lowerMsg.contains("student_id_key")) {
                    msg = "This Student ID is already registered to another account.";
                } else if (lowerMsg.contains("google_sub") || lowerMsg.contains("googlesub")) {
                    msg = "This Google account is already linked to an existing profile.";
                } else if (lowerMsg.contains("email")) {
                    msg = "This email address is already registered.";
                } else {
                    msg = "Database Error: " + rootMsg;
                }
            } else {
                msg = "Database Error: " + rootMsg;
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "status", 409,
                "error", "Conflict",
                "message", msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", "An unexpected error occurred"));
    }
}
