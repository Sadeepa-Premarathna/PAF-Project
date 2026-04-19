package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.CommentResponse;
import com.smartcampus.auth.dto.CreateTicketRequest;
import com.smartcampus.auth.dto.TicketResponse;
import com.smartcampus.auth.dto.UpdateTicketRequest;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.TicketStatus;
import com.smartcampus.auth.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> create(
            @Valid @RequestBody CreateTicketRequest req,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(req, actor));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> list(@AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(ticketService.listTickets(actor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> get(@PathVariable UUID id,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(ticketService.getTicket(id, actor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> update(@PathVariable UUID id,
            @RequestBody UpdateTicketRequest req,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(ticketService.updateTicket(id, req, actor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
            @AuthenticationPrincipal AppUser actor) {
        ticketService.deleteTicket(id, actor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Map<String, Object>> uploadImages(
            @PathVariable UUID id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal AppUser actor) {
        List<String> urls = ticketService.attachImages(id, files, actor);
        return ResponseEntity.ok(Map.of("imageUrls", urls));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, body.get("content"), actor));
    }

    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<CommentResponse> editComment(
            @PathVariable UUID id,
            @PathVariable UUID cid,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AppUser actor) {
        return ResponseEntity.ok(ticketService.editComment(cid, body.get("content"), actor));
    }

    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID cid,
            @AuthenticationPrincipal AppUser actor) {
        ticketService.deleteComment(cid, actor);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/open-count")
    public ResponseEntity<Map<String, Long>> openCount() {
        return ResponseEntity.ok(Map.of("count", ticketService.countByStatus(TicketStatus.OPEN)));
    }
}
