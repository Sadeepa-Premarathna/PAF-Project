package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.dto.CommentResponse;
import com.smartcampus.auth.dto.CreateTicketRequest;
import com.smartcampus.auth.dto.TicketResponse;
import com.smartcampus.auth.dto.UpdateTicketRequest;
import com.smartcampus.auth.entity.*;
import com.smartcampus.auth.repository.*;
import com.smartcampus.auth.service.FileStorageService;
import com.smartcampus.auth.service.TicketService;
import com.example.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepo;
    private final TicketCommentRepository commentRepo;
    private final AppUserRepository userRepo;
    private final FileStorageService fileStorage;
    private final NotificationService notificationService;

    @Override
    public TicketResponse createTicket(CreateTicketRequest req, AppUser actor) {
        // Ensure we are using a managed entity for the actor
        AppUser creator = userRepo.findById(actor.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Ticket ticket = Ticket.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .resourceLocation(req.getResourceLocation())
                .category(req.getCategory())
                .priority(req.getPriority())
                .preferredContact(req.getPreferredContact())
                .status(TicketStatus.OPEN)
                .createdBy(creator)
                .build();
        return TicketResponse.fromSummary(ticketRepo.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicket(UUID ticketId, AppUser actor) {
        Ticket ticket = findOrThrow(ticketId);
        // USER can only see their own tickets; ADMIN and STAFF can see all
        if (actor.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return TicketResponse.from(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> listTickets(AppUser actor) {
        if (actor.getRole() == Role.USER) {
            return ticketRepo.findByCreatedByOrderByCreatedAtDesc(actor)
                    .stream().map(TicketResponse::fromSummary).toList();
        }
        return ticketRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(TicketResponse::fromSummary).toList();
    }

    @Override
    public TicketResponse updateTicket(UUID ticketId, UpdateTicketRequest req, AppUser actor) {
        if (actor.getRole() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only staff or admin can update tickets");
        }
        Ticket ticket = findOrThrow(ticketId);

        if (req.getStatus() != null) {
            // Validate status transitions
            validateTransition(ticket.getStatus(), req.getStatus(), actor);
            ticket.setStatus(req.getStatus());

            if (req.getStatus() == TicketStatus.REJECTED) {
                if (req.getRejectionReason() == null || req.getRejectionReason().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
                }
                ticket.setRejectionReason(req.getRejectionReason());
            }
        }

        if (req.getAssignedToId() != null) {
            AppUser assignee = userRepo.findById(req.getAssignedToId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            ticket.setAssignedTo(assignee);
        }

        if (req.getResolutionNote() != null) {
            ticket.setResolutionNote(req.getResolutionNote());
        }

        Ticket savedTicket = ticketRepo.save(ticket);
        
        // Notify owner about status change if it happened
        if (req.getStatus() != null) {
            notificationService.notifyTicketUpdated(
                ticket.getCreatedBy().getId().toString(), 
                ticket.getId().toString(), 
                req.getStatus().name()
            );
        }

        return TicketResponse.fromSummary(savedTicket);
    }

    @Override
    public void deleteTicket(UUID ticketId, AppUser actor) {
        if (actor.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can delete tickets");
        }
        Ticket ticket = findOrThrow(ticketId);
        // cleanup images from disk
        ticket.getImages().forEach(img -> fileStorage.deleteByUrl(img.getImageUrl()));
        ticketRepo.delete(ticket);
    }

    @Override
    public List<String> attachImages(UUID ticketId, List<MultipartFile> files, AppUser actor) {
        Ticket ticket = findOrThrow(ticketId);

        // Only ticket owner or admin/staff can attach
        if (actor.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        int existing = ticket.getImages().size();
        if (existing + files.size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A ticket can have at most 3 images. Currently has " + existing + ".");
        }

        List<String> urls = files.stream().map(f -> {
            String url = fileStorage.storeTicketImage(f);
            TicketImage img = TicketImage.builder()
                    .ticket(ticket).imageUrl(url).fileName(f.getOriginalFilename()).build();
            ticket.getImages().add(img);
            return url;
        }).toList();

        ticketRepo.save(ticket);
        return urls;
    }

    @Override
    public CommentResponse addComment(UUID ticketId, String content, AppUser actor) {
        Ticket ticket = findOrThrow(ticketId);
        // USER can only comment on their own ticket
        if (actor.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot be empty");
        }
        TicketComment comment = TicketComment.builder()
                .ticket(ticket).author(actor).content(content.trim()).build();
        
        TicketComment savedComment = commentRepo.save(comment);

        // Notify ticket owner about new comment (if commenter is not the owner)
        if (!ticket.getCreatedBy().getId().equals(actor.getId())) {
            notificationService.notifyNewComment(
                ticket.getCreatedBy().getId().toString(), 
                ticket.getId().toString()
            );
        }

        return CommentResponse.from(savedComment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID ticketId, AppUser actor) {
        Ticket ticket = findOrThrow(ticketId);
        // Authorization check matching getTicket
        if (actor.getRole() == Role.USER && !ticket.getCreatedBy().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ticket.getComments().stream().map(CommentResponse::from).toList();
    }

    @Override
    public TicketResponse updateStatus(UUID ticketId, TicketStatus status, AppUser actor) {
        if (actor.getRole() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only staff or admin can update status");
        }
        Ticket ticket = findOrThrow(ticketId);
        
        validateTransition(ticket.getStatus(), status, actor);
        ticket.setStatus(status);
        
        Ticket saved = ticketRepo.save(ticket);
        
        notificationService.notifyTicketUpdated(
            ticket.getCreatedBy().getId().toString(), 
            ticket.getId().toString(), 
            status.name()
        );
        
        return TicketResponse.from(saved);
    }

    @Override
    public CommentResponse editComment(UUID commentId, String content, AppUser actor) {
        TicketComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!comment.getAuthor().getId().equals(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the author can edit this comment");
        }
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot be empty");
        }
        comment.setContent(content.trim());
        return CommentResponse.from(commentRepo.save(comment));
    }

    @Override
    public void deleteComment(UUID commentId, AppUser actor) {
        TicketComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        boolean isAuthor = comment.getAuthor().getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this comment");
        }
        commentRepo.delete(comment);
    }

    @Override
    public long countByStatus(TicketStatus status) {
        return ticketRepo.countByStatus(status);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Ticket findOrThrow(UUID id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private void validateTransition(TicketStatus current, TicketStatus next, AppUser actor) {
        // REJECTED is admin-only
        if (next == TicketStatus.REJECTED && actor.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can reject a ticket");
        }
        // CLOSED: only after RESOLVED
        if (next == TicketStatus.CLOSED && current != TicketStatus.RESOLVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Ticket must be RESOLVED before it can be CLOSED");
        }
    }
}
