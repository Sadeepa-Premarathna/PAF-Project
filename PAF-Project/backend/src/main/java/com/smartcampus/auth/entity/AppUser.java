package com.smartcampus.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String pictureUrl;

    @Column(nullable = true)
    private String googleSub;

    @Column(nullable = true)
    private String passwordHash;

    @Column(unique = true, nullable = true, length = 20)
    private String studentId;

    @Column(nullable = true, length = 100)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder.Default
    private boolean active = true;

    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.role == null) {
            this.role = Role.USER;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
