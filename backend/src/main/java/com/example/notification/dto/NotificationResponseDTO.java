package com.example.notification.dto;

import com.example.notification.model.Notification;
import com.example.notification.model.NotificationType;
import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Long id;
    private String userId;
    private NotificationType type;
    private String message;
    private boolean isRead;
    private String referenceId;
    private LocalDateTime createdAt;

    // ── Static factory ────────────────────────────────
    public static NotificationResponseDTO from(Notification n) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(n.getId());
        dto.setUserId(n.getUserId());
        dto.setType(n.getType());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setReferenceId(n.getReferenceId());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }

    // ── Getters ──────────────────────────────────────
    public Long getId()                    { return id; }
    public String getUserId()                { return userId; }
    public NotificationType getType()      { return type; }
    public String getMessage()             { return message; }
    public boolean isRead()                { return isRead; }
    public String getReferenceId()           { return referenceId; }
    public LocalDateTime getCreatedAt()    { return createdAt; }

    // ── Setters ──────────────────────────────────────
    public void setId(Long id)                         { this.id = id; }
    public void setUserId(String userId)                 { this.userId = userId; }
    public void setType(NotificationType type)         { this.type = type; }
    public void setMessage(String message)             { this.message = message; }
    public void setRead(boolean isRead)                { this.isRead = isRead; }
    public void setReferenceId(String referenceId)       { this.referenceId = referenceId; }
    public void setCreatedAt(LocalDateTime createdAt)  { this.createdAt = createdAt; }
}