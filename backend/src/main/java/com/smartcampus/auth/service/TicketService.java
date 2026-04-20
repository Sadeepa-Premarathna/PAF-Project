package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.CommentResponse;
import com.smartcampus.auth.dto.CreateTicketRequest;
import com.smartcampus.auth.dto.TicketResponse;
import com.smartcampus.auth.dto.UpdateTicketRequest;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Ticket;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request, AppUser actor);
    TicketResponse getTicket(UUID ticketId, AppUser actor);
    List<TicketResponse> listTickets(AppUser actor);
    TicketResponse updateTicket(UUID ticketId, UpdateTicketRequest request, AppUser actor);
    void deleteTicket(UUID ticketId, AppUser actor);
    List<String> attachImages(UUID ticketId, List<MultipartFile> files, AppUser actor);
    CommentResponse addComment(UUID ticketId, String content, AppUser actor);
    List<CommentResponse> getComments(UUID ticketId, AppUser actor);
    CommentResponse editComment(UUID commentId, String content, AppUser actor);
    void deleteComment(UUID commentId, AppUser actor);
    TicketResponse updateStatus(UUID ticketId, com.smartcampus.auth.entity.TicketStatus status, AppUser actor);
    long countByStatus(com.smartcampus.auth.entity.TicketStatus status);
}
