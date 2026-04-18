package com.smartcampus.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Ticket ticket;

    @Column(nullable = false)
    private String imageUrl;   // e.g. /uploads/ticket-images/uuid.jpg

    @Column(nullable = false)
    private String fileName;

    @Builder.Default
    private Instant uploadedAt = Instant.now();
}
