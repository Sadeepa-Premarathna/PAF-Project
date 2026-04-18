package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.*;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TicketResponse {
    private UUID id;
    private String title;
    private String description;
    private String resourceLocation;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String preferredContact;
    private String resolutionNote;
    private String rejectionReason;

    private UserInfo createdBy;
    private UserInfo assignedTo;

    private List<String> imageUrls;
    private List<CommentResponse> comments;
    private int commentCount;

    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    public static class UserInfo {
        private UUID id;
        private String name;
        private String email;
        private String role;
        private String department;
    }

    public static TicketResponse from(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .resourceLocation(t.getResourceLocation())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .preferredContact(t.getPreferredContact())
                .resolutionNote(t.getResolutionNote())
                .rejectionReason(t.getRejectionReason())
                .createdBy(toUserInfo(t.getCreatedBy()))
                .assignedTo(t.getAssignedTo() != null ? toUserInfo(t.getAssignedTo()) : null)
                .imageUrls(t.getImages().stream().map(TicketImage::getImageUrl).toList())
                .comments(t.getComments().stream().map(CommentResponse::from).toList())
                .commentCount(t.getComments().size())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    public static TicketResponse fromSummary(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .resourceLocation(t.getResourceLocation())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .preferredContact(t.getPreferredContact())
                .resolutionNote(t.getResolutionNote())
                .rejectionReason(t.getRejectionReason())
                .createdBy(toUserInfo(t.getCreatedBy()))
                .assignedTo(t.getAssignedTo() != null ? toUserInfo(t.getAssignedTo()) : null)
                .imageUrls(t.getImages().stream().map(TicketImage::getImageUrl).toList())
                .commentCount(t.getComments().size())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private static UserInfo toUserInfo(AppUser u) {
        if (u == null) return null;
        return UserInfo.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .department(u.getDepartment())
                .build();
    }
}
