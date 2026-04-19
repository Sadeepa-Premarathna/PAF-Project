package com.example.booking.controller;

import com.example.booking.model.Booking;
import com.example.booking.service.BookingService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService s) {
        this.service = s;
    }

    // ✅ CREATE BOOKING (with error handling)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking b) {
        try {
            Booking saved = service.createBooking(b);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET ALL BOOKINGS
    @GetMapping
    public List<Booking> getAll() {
        return service.getAll();
    }

    // ✅ APPROVE / REJECT
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Booking updated = service.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}