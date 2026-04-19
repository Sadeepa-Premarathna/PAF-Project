package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Ticket;
import com.smartcampus.auth.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(AppUser createdBy);
    List<Ticket> findByAssignedToOrderByCreatedAtDesc(AppUser assignedTo);
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    List<Ticket> findAllByOrderByCreatedAtDesc();
    long countByStatus(TicketStatus status);
}
