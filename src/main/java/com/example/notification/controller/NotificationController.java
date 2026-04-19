package com.example.notification.controller;

import com.example.notification.dto.NotificationRequestDTO;
import com.example.notification.dto.NotificationResponseDTO;
import com.example.notification.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@Validated
public class NotificationController {

    private final NotificationService notificationService;

    
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<NotificationResponseDTO> send(
            @Valid @RequestBody NotificationRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(notificationService.send(dto));
    }

    // GET /api/notifications?userId=1
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAll(
            @RequestParam @NotNull(message = "userId is required") Long userId) {
        return ResponseEntity.ok(notificationService.getAll(userId));
    }

    // GET /api/notifications/unread-count?userId=1
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestParam @NotNull(message = "userId is required") Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
            @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // PUT /api/notifications/read-all?userId=1
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @RequestParam @NotNull(message = "userId is required") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/notifications?userId=1
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(
            @RequestParam @NotNull(message = "userId is required") Long userId) {
        notificationService.deleteAll(userId);
        return ResponseEntity.noContent().build();
    }
}