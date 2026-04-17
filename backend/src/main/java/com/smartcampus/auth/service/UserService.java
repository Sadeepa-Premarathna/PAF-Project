package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.OAuth2UserInfo;
import com.smartcampus.auth.entity.AppUser;
import com.smartcampus.auth.entity.Role;

import java.util.List;
import java.util.UUID;

public interface UserService {
    AppUser findOrCreateUser(OAuth2UserInfo userInfo);
    AppUser findById(UUID userId);
    AppUser updateRole(UUID userId, Role role);
    List<AppUser> findAllByRole(Role role);
    List<AppUser> findAll();
}
