package com.example.booking.service;

import com.example.booking.model.Booking;
import com.example.booking.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repo;

    public BookingService(BookingRepository r) {
        this.repo = r;
    }

    // ---------------- CREATE ----------------
    public Booking createBooking(Booking b) {

        validateBooking(b);

        LocalDate bookingDate = LocalDate.parse(b.getDate());

        if (bookingDate.isBefore(LocalDate.now()))
            throw new RuntimeException("Cannot book past dates!");

        if (bookingDate.isAfter(LocalDate.now().plusDays(7)))
            throw new RuntimeException("Bookings allowed only within 7 days!");

        checkConflicts(b, null);

        b.setStatus("PENDING");
        return repo.save(b);
    }

    // ---------------- GET ----------------
    public List<Booking> getAll() {
        return repo.findAll();
    }

    // ---------------- STATUS ----------------
    public Booking updateStatus(Long id, String status) {

        Booking b = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!status.matches("APPROVED|REJECTED|PENDING"))
            throw new RuntimeException("Invalid status!");

        b.setStatus(status.toUpperCase());
        return repo.save(b);
    }

    // ---------------- EDIT ----------------
    public Booking editBooking(Long id, Booking updated) {

        Booking existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"PENDING".equals(existing.getStatus()))
            throw new RuntimeException("Only PENDING bookings can be edited!");

        validateBooking(updated);

        LocalDate bookingDate = LocalDate.parse(updated.getDate());

        if (bookingDate.isBefore(LocalDate.now()))
            throw new RuntimeException("Cannot use past date!");

        if (bookingDate.isAfter(LocalDate.now().plusDays(7)))
            throw new RuntimeException("Only 7 days booking allowed!");

        checkConflicts(updated, id);

        existing.setResourceId(updated.getResourceId());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());

        return repo.save(existing);
    }

    // ---------------- DELETE (7 DAY RULE) ----------------
    public void deleteBooking(Long id) {

        Booking b = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        LocalDate bookingDate = LocalDate.parse(b.getDate());

        long days = ChronoUnit.DAYS.between(LocalDate.now(), bookingDate);

        if (days > 7)
            throw new RuntimeException("You can only delete bookings within 7 days!");

        repo.deleteById(id);
    }

    // ---------------- VALIDATION ----------------
    private void validateBooking(Booking b) {

        if (b.getResourceId() == null || b.getResourceId().isEmpty())
            throw new RuntimeException("Resource required!");

        if (b.getDate() == null || b.getDate().isEmpty())
            throw new RuntimeException("Date required!");

        if (b.getStartTime() == null || b.getEndTime() == null)
            throw new RuntimeException("Time required!");

        if (b.getStartTime().compareTo(b.getEndTime()) >= 0)
            throw new RuntimeException("Invalid time range!");
    }

    // ---------------- CONFLICT CHECK ----------------
    private void checkConflicts(Booking b, Long ignoreId) {

        List<Booking> list = repo.findByResourceIdAndDate(b.getResourceId(), b.getDate());

        for (Booking e : list) {

            if (ignoreId != null && e.getId().equals(ignoreId)) continue;

            boolean overlap =
                    b.getStartTime().compareTo(e.getEndTime()) < 0 &&
                    b.getEndTime().compareTo(e.getStartTime()) > 0;

            if (overlap)
                throw new RuntimeException("Time slot already booked!");
        }
    }
}