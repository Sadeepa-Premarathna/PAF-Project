package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.OAuth2UserInfo;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.auth.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private AppUserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private OAuth2UserInfo userInfo;

    @BeforeEach
    void setUp() {
        userInfo = OAuth2UserInfo.builder()
                .sub("google-sub-123")
                .email("user@example.com")
                .name("Test User")
                .picture("https://example.com/pic.jpg")
                .build();
    }

    @Test
    void findOrCreateUser_newUser_shouldCreateWithRoleUser() {
        when(userRepository.findByGoogleSub("google-sub-123")).thenReturn(Optional.empty());
        when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        AppUser result = userService.findOrCreateUser(userInfo);

        assertThat(result.getRole()).isEqualTo(Role.USER);
        assertThat(result.getEmail()).isEqualTo("user@example.com");
        assertThat(result.isActive()).isTrue();
        verify(userRepository).save(any(AppUser.class));
    }

    @Test
    void findOrCreateUser_existingUser_shouldUpdateNameAndPicture() {
        AppUser existing = AppUser.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .name("Old Name")
                .googleSub("google-sub-123")
                .role(Role.ADMIN)
                .active(true)
                .build();

        when(userRepository.findByGoogleSub("google-sub-123")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        AppUser result = userService.findOrCreateUser(userInfo);

        assertThat(result.getName()).isEqualTo("Test User");
        assertThat(result.getRole()).isEqualTo(Role.ADMIN); // role must NOT change
    }

    @Test
    void updateRole_shouldChangeUserRole() {
        AppUser user = AppUser.builder()
                .id(UUID.randomUUID())
                .role(Role.USER)
                .active(true)
                .build();

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AppUser result = userService.updateRole(user.getId(), Role.TECHNICIAN);

        assertThat(result.getRole()).isEqualTo(Role.TECHNICIAN);
    }
}
