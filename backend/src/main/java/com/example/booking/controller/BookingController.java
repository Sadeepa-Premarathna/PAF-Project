package com.example.booking.controller;

import com.example.booking.model.Booking;
import com.example.booking.service.BookingService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService s) {
        this.service = s;
    }

    // CREATE BOOKING
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking b) {
        try {
            Booking saved = service.createBooking(b);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET ALL BOOKINGS (Admin/Staff with permission)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STAFF_MEMBER') and principal.permissions.contains('BOOKINGS'))")
    public List<Booking> getAll() {
        return service.getAll();
    }

    // GET BOOKINGS BY USER ID
    @GetMapping("/user/{userId}")
    public List<Booking> getByUser(@PathVariable String userId) {
        return service.getByUserId(userId);
    }

    // APPROVE / REJECT / CANCEL
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STAFF_MEMBER') and principal.permissions.contains('BOOKINGS'))")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        try {
            Booking updated = service.updateStatus(id, status, reason);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Keep old endpoint for backward compat
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STAFF_MEMBER') and principal.permissions.contains('BOOKINGS'))")
    public ResponseEntity<?> updateStatusLegacy(@PathVariable Long id, @RequestParam String status) {
        try {
            Booking updated = service.updateStatus(id, status, null);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}