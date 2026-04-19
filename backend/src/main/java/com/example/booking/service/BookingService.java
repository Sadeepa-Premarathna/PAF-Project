package com.example.booking.service;

import com.example.booking.model.Booking;
import com.example.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repo;

    public BookingService(BookingRepository r) {
        this.repo = r;
    }

    // Create booking with full validation
    public Booking createBooking(Booking b) {

        // --------------------------
        // 1️⃣ Input Validation
        // --------------------------
        if (b.getResourceId() == null || b.getResourceId().isEmpty()) {
            throw new RuntimeException("Resource is required!");
        }
        if (b.getDate() == null || b.getDate().isEmpty()) {
            throw new RuntimeException("Date is required!");
        }
        if (b.getStartTime() == null || b.getStartTime().isEmpty() ||
            b.getEndTime() == null || b.getEndTime().isEmpty()) {
            throw new RuntimeException("Start time and end time are required!");
        }

        // --------------------------
        // 2️⃣ Time Validation
        // --------------------------
        if (b.getStartTime().compareTo(b.getEndTime()) >= 0) {
            throw new RuntimeException("Invalid time range! Start time must be before end time.");
        }

        // --------------------------
        // 3️⃣ Past Date Block
        // --------------------------
        LocalDate bookingDate = LocalDate.parse(b.getDate(), DateTimeFormatter.ISO_DATE);
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot book for past date!");
        }

        // --------------------------
        // 4️⃣ Conflict Check & Duplicate Booking
        // --------------------------
        List<Booking> existing = repo.findByResourceIdAndDate(b.getResourceId(), b.getDate());
        for (Booking e : existing) {
            // Time overlap check
            boolean overlap = b.getStartTime().compareTo(e.getEndTime()) < 0 &&
                              b.getEndTime().compareTo(e.getStartTime()) > 0;
            if (overlap) {
                throw new RuntimeException("Time slot already booked! Please select another time.");
            }

            // Optional: Duplicate booking for same purpose
            if (b.getPurpose() != null && b.getPurpose().equalsIgnoreCase(e.getPurpose())) {
                throw new RuntimeException("Duplicate booking with same purpose!");
            }
        }

        // --------------------------
        // 5️⃣ Status Handling
        // --------------------------
        b.setStatus("PENDING");

        return repo.save(b);
    }

    // Get all bookings
    public List<Booking> getAll() {
        return repo.findAll();
    }

    // Update status
    public Booking updateStatus(Long id, String status) {
        Booking b = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        // Only allow these status values
        if (!status.equalsIgnoreCase("APPROVED") &&
            !status.equalsIgnoreCase("REJECTED") &&
            !status.equalsIgnoreCase("PENDING")) {
            throw new RuntimeException("Invalid status value!");
        }
        b.setStatus(status.toUpperCase());
        return repo.save(b);
    }
}