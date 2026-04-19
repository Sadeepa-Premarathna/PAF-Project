package com.example.notification.dto;

import com.example.notification.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class NotificationRequestDTO {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotBlank(message = "Message cannot be empty")
    @Size(min = 5, max = 500, message = "Message must be between 5 and 500 characters")
    private String message;

    private String referenceId;

    // ── Getters ──────────────────────────────────────
    public String getUserId()           { return userId; }
    public NotificationType getType() { return type; }
    public String getMessage()        { return message; }
    public String getReferenceId()      { return referenceId; }

    // ── Setters ──────────────────────────────────────
    public void setUserId(String userId)            { this.userId = userId; }
    public void setType(NotificationType type)    { this.type = type; }
    public void setMessage(String message)        { this.message = message; }
    public void setReferenceId(String referenceId)  { this.referenceId = referenceId; }
}