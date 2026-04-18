package com.example.notification.service;

import com.example.notification.dto.NotificationRequestDTO;
import com.example.notification.dto.NotificationResponseDTO;
import com.example.notification.model.Notification;
import com.example.notification.model.NotificationType;
import com.example.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ── Constructor injection (Lombok නැතිව) ─────────
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ── Admin: send notification ──────────────────────
    public NotificationResponseDTO send(NotificationRequestDTO dto) {
        Notification n = new Notification();
        n.setUserId(dto.getUserId());
        n.setType(dto.getType());
        n.setMessage(dto.getMessage());
        n.setReferenceId(dto.getReferenceId());
        return NotificationResponseDTO.from(notificationRepository.save(n));
    }

    // ── Internal helpers ──────────────────────────────
    public void notifyBookingApproved(Long userId, Long bookingId) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.BOOKING_APPROVED);
        dto.setMessage("Your booking #" + bookingId + " has been approved.");
        dto.setReferenceId(bookingId);
        send(dto);
    }

    public void notifyBookingRejected(Long userId, Long bookingId, String reason) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.BOOKING_REJECTED);
        dto.setMessage("Your booking #" + bookingId + " was rejected. Reason: " + reason);
        dto.setReferenceId(bookingId);
        send(dto);
    }

    public void notifyTicketUpdated(Long userId, Long ticketId, String newStatus) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.TICKET_UPDATED);
        dto.setMessage("Your ticket #" + ticketId + " status changed to: " + newStatus);
        dto.setReferenceId(ticketId);
        send(dto);
    }

    public void notifyNewComment(Long userId, Long ticketId) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.NEW_COMMENT);
        dto.setMessage("A new comment was added to your ticket #" + ticketId + ".");
        dto.setReferenceId(ticketId);
        send(dto);
    }

    // ── Queries ───────────────────────────────────────
    public List<NotificationResponseDTO> getAll(Long userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponseDTO::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponseDTO markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        n.setRead(true);
        return NotificationResponseDTO.from(notificationRepository.save(n));
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}