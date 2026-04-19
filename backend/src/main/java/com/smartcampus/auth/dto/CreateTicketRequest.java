package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.TicketCategory;
import com.smartcampus.auth.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String resourceLocation;

    @NotNull
    private TicketCategory category;

    @NotNull
    private TicketPriority priority;

    private String preferredContact;
}
