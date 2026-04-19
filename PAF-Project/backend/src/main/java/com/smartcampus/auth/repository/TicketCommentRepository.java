package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, UUID> {
}
