package com.smartcampus.auth.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class OAuthCallbackRequest {
    @NotBlank private String code;
    @NotBlank private String redirectUri;
}
