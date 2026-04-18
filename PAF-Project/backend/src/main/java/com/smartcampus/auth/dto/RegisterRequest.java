package com.smartcampus.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(max = 100) private String name;
    @NotBlank private String studentId;
    @NotBlank @Size(max = 100) private String department;
    @NotBlank @Email private String email;
    private String password; // nullable for OAuth profile completion (googleSub present)
    private String googleSub; // nullable - for OAuth profile completion
}
