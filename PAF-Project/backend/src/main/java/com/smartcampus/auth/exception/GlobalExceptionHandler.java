package com.smartcampus.auth.exception;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(OAuthException.class)
    public ResponseEntity<Map<String,String>> handleOAuth(OAuthException ex) {
        return ResponseEntity.badRequest().body(Map.of("error","oauth_error","message",ex.getMessage()));
    }
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String,String>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error","unauthorized","message",ex.getMessage()));
    }
    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<Map<String,String>> handleDisabled(AccountDisabledException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error","account_disabled","message",ex.getMessage()));
    }
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String,String>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error","access_denied","message","Insufficient permissions"));
    }
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> handleValidation(
            org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .findFirst().orElse("Validation failed");
        return ResponseEntity.badRequest().body(Map.of("error","validation_error","message",msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error","internal_error","message","An unexpected error occurred"));
    }
}
