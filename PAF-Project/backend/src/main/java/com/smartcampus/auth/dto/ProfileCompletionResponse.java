package com.smartcampus.auth.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ProfileCompletionResponse {
    private String name;
    private String email;
    private String googleSub;
}
