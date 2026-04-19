package com.example.notification.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    private String userId;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotNull(message = "Message is required")
    private String message;

    private boolean isRead = false;

    private String referenceId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
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