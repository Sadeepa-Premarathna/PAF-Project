package com.example.booking.service;

import com.example.booking.model.Booking;
import com.example.booking.repository.BookingRepository;
import com.example.notification.dto.NotificationRequestDTO;
import com.example.notification.model.NotificationType;
import com.example.notification.service.NotificationService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repo;
    private final NotificationService notificationService;

    public BookingService(BookingRepository r, NotificationService ns) {
        this.repo = r;
        this.notificationService = ns;
    }

    public Booking createBooking(Booking b) {
        if (b.getResourceId() == null || b.getResourceId().isEmpty())
            throw new RuntimeException("Resource is required!");
        if (b.getDate() == null || b.getDate().isEmpty())
            throw new RuntimeException("Date is required!");
        if (b.getStartTime() == null || b.getStartTime().isEmpty() ||
            b.getEndTime() == null || b.getEndTime().isEmpty())
            throw new RuntimeException("Start time and end time are required!");
        if (b.getStartTime().compareTo(b.getEndTime()) >= 0)
            throw new RuntimeException("Invalid time range! Start time must be before end time.");

        LocalDate bookingDate = LocalDate.parse(b.getDate(), DateTimeFormatter.ISO_DATE);
        if (bookingDate.isBefore(LocalDate.now()))
            throw new RuntimeException("Cannot book for past date!");

        // Conflict check
        List<Booking> existing = repo.findByResourceIdAndDate(b.getResourceId(), b.getDate());
        for (Booking e : existing) {
            if ("REJECTED".equals(e.getStatus()) || "CANCELLED".equals(e.getStatus())) continue;
            boolean overlap = b.getStartTime().compareTo(e.getEndTime()) < 0 &&
                              b.getEndTime().compareTo(e.getStartTime()) > 0;
            if (overlap)
                throw new RuntimeException("Time slot already booked! Please select another time.");
        }

        b.setStatus("PENDING");
        return repo.save(b);
    }

    public List<Booking> getAll() {
        return repo.findAll();
    }

    public List<Booking> getByUserId(String userId) {
        return repo.findByUserId(userId);
    }

    public Booking updateStatus(Long id, String status, String reason) {
        Booking b = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        String s = status.toUpperCase();
        if (!s.equals("APPROVED") && !s.equals("REJECTED") &&
            !s.equals("PENDING") && !s.equals("CANCELLED"))
            throw new RuntimeException("Invalid status value!");
        b.setStatus(s);
        if (reason != null && !reason.isEmpty()) {
            b.setRejectionReason(reason);
        }
        Booking saved = repo.save(b);

        // Trigger Notification
        if ("APPROVED".equals(s)) {
            notificationService.notifyBookingApproved(b.getUserId(), b.getId());
        } else if ("REJECTED".equals(s)) {
            notificationService.notifyBookingRejected(b.getUserId(), b.getId(), reason);
        }

        return saved;
    }
}