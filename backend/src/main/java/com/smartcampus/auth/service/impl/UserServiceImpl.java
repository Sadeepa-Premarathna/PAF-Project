package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.dto.OAuth2UserInfo;
import com.smartcampus.auth.dto.RegisterRequest;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.auth.service.PasswordService;
import com.smartcampus.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository userRepository;
    private final PasswordService passwordService;

    @Override
    public AppUser findOrCreateUser(OAuth2UserInfo userInfo) {
        return userRepository.findByGoogleSub(userInfo.getSub())
                .map(existing -> {
                    existing.setName(userInfo.getName());
                    existing.setPictureUrl(userInfo.getPicture());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(AppUser.builder()
                        .email(userInfo.getEmail()).name(userInfo.getName())
                        .pictureUrl(userInfo.getPicture()).googleSub(userInfo.getSub())
                        .role(Role.USER).active(true).build()));
    }

    @Override
    public AppUser findById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    @Override
    public AppUser updateRole(UUID userId, Role role) {
        AppUser user = findById(userId);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public List<AppUser> findAllByRole(Role role) { return userRepository.findAllByRole(role); }

    @Override
    public List<AppUser> findAll() { return userRepository.findAll(); }

    @Override
    public void deactivateUser(UUID userId) {
        AppUser user = findById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public AppUser createPasswordUser(RegisterRequest req) {
        String hashedPassword = passwordService.hash(req.getPassword());
        AppUser user = AppUser.builder()
                .name(req.getName())
                .studentId(req.getStudentId())
                .department(req.getDepartment())
                .email(req.getEmail())
                .passwordHash(hashedPassword)
                .googleSub(null)
                .role(Role.USER)
                .active(true)
                .build();
        return userRepository.save(user);
    }

    @Override
    public AppUser createOAuthUser(RegisterRequest req) {
        AppUser user = AppUser.builder()
                .name(req.getName())
                .studentId(req.getStudentId())
                .department(req.getDepartment())
                .email(req.getEmail())
                .passwordHash(null)
                .googleSub(req.getGoogleSub())
                .role(Role.USER)
                .active(true)
                .build();
        return userRepository.save(user);
    }

    @Override
    public Optional<AppUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public Optional<AppUser> findByGoogleSub(String googleSub) {
        return userRepository.findByGoogleSub(googleSub);
    }

    @Override
    public AppUser createStaffMember(com.smartcampus.auth.dto.CreateStaffRequest req) {
        System.out.println("[STAFF CREATION] Email: " + req.getEmail() + " | Permissions: " + req.getPermissions());
        
        String hashedPassword = passwordService.hash(req.getPassword());
        AppUser user = AppUser.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(hashedPassword)
                .role(Role.STAFF_MEMBER)
                .permissions(req.getPermissions() != null ? req.getPermissions() : new java.util.HashSet<>())
                .active(true)
                .build();
        
        AppUser savedUser = userRepository.save(user);
        System.out.println("[STAFF CREATION] Saved User Permissions: " + savedUser.getPermissions());
        return savedUser;
    }
}
