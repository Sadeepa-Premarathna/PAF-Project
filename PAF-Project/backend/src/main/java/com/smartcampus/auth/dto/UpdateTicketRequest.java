package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.TicketStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class UpdateTicketRequest {
    private TicketStatus status;
    private UUID assignedToId;
    private String resolutionNote;
    private String rejectionReason;
}
