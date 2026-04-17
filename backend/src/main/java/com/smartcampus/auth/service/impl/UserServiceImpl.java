package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.dto.OAuth2UserInfo;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.repository.AppUserRepository;
import com.smartcampus.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AppUserRepository userRepository;

    @Override
    public AppUser findOrCreateUser(OAuth2UserInfo userInfo) {
        return userRepository.findByGoogleSub(userInfo.getSub())
                .map(existing -> {
                    existing.setName(userInfo.getName());
                    existing.setPictureUrl(userInfo.getPicture());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(
                        AppUser.builder()
                                .email(userInfo.getEmail())
                                .name(userInfo.getName())
                                .pictureUrl(userInfo.getPicture())
                                .googleSub(userInfo.getSub())
                                .role(Role.USER)
                                .active(true)
                                .build()
                ));
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
    public List<AppUser> findAllByRole(Role role) {
        return userRepository.findAllByRole(role);
    }

    @Override
    public List<AppUser> findAll() {
        return userRepository.findAll();
    }
}
