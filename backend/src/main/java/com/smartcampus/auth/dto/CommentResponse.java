package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.TicketComment;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CommentResponse {
    private UUID id;
    private String content;
    private UUID authorId;
    private String authorName;
    private String authorRole;
    private Instant createdAt;
    private Instant updatedAt;

    public static CommentResponse from(TicketComment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .content(c.getContent())
                .authorId(c.getAuthor().getId())
                .authorName(c.getAuthor().getName())
                .authorRole(c.getAuthor().getRole().name())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
