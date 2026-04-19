package com.example.booking.repository;

import com.example.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByResourceIdAndDate(String resourceId, String date);
}