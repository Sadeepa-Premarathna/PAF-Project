package com.smartcampus.auth.dto;
import com.smartcampus.auth.entity.AppUser;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;
@Data @Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private String pictureUrl;
    private String role;
    private String studentId;
    private String department;
    private java.util.Set<String> permissions;

    public static UserResponse from(AppUser user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole().name())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .permissions(user.getPermissions())
                .build();
    }
}
