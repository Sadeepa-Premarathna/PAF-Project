package com.smartcampus.auth.dto;
import com.smartcampus.auth.entity.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class UpdateRoleRequest {
    @NotNull private Role role;
}
