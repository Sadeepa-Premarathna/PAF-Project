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
    public void notifyBookingApproved(String userId, Long bookingId) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.BOOKING_APPROVED);
        dto.setMessage("Your booking #" + bookingId + " has been approved.");
        dto.setReferenceId(String.valueOf(bookingId));
        send(dto);
    }

    public void notifyBookingRejected(String userId, Long bookingId, String reason) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.BOOKING_REJECTED);
        dto.setMessage("Your booking #" + bookingId + " was rejected. Reason: " + reason);
        dto.setReferenceId(String.valueOf(bookingId));
        send(dto);
    }

    public void notifyTicketUpdated(String userId, String ticketId, String newStatus) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.TICKET_UPDATED);
        dto.setMessage("Your ticket #" + ticketId + " status changed to: " + newStatus);
        dto.setReferenceId(ticketId);
        send(dto);
    }

    public void notifyNewComment(String userId, String ticketId) {
        NotificationRequestDTO dto = new NotificationRequestDTO();
        dto.setUserId(userId);
        dto.setType(NotificationType.NEW_COMMENT);
        dto.setMessage("A new comment was added to your ticket #" + ticketId + ".");
        dto.setReferenceId(ticketId);
        send(dto);
    }

    // ── Queries ───────────────────────────────────────
    public List<NotificationResponseDTO> getAll(String userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponseDTO::from)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponseDTO markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        n.setRead(true);
        return NotificationResponseDTO.from(notificationRepository.save(n));
    }

    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public void deleteAll(String userId) {
        notificationRepository.deleteByUserId(userId);
    }
}