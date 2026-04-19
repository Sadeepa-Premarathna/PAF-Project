package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.OAuth2UserInfo;

public interface GoogleOAuthClient {
    OAuth2UserInfo exchangeCodeAndGetUserInfo(String code, String redirectUri);
}
