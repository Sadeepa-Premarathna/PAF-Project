package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.dto.OAuth2UserInfo;
import com.smartcampus.auth.exception.OAuthException;
import com.smartcampus.auth.service.GoogleOAuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleOAuthClientImpl implements GoogleOAuthClient {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    private final RestTemplate restTemplate;

    @jakarta.annotation.PostConstruct
    public void init() {
        org.slf4j.LoggerFactory.getLogger(GoogleOAuthClientImpl.class)
            .info("GoogleOAuthClient loaded. client_id={}...{}", 
                clientId.substring(0, Math.min(20, clientId.length())),
                clientId.substring(Math.max(0, clientId.length() - 10)));
    }

    @Override
    public OAuth2UserInfo exchangeCodeAndGetUserInfo(String code, String redirectUri) {
        String accessToken = exchangeCode(code, redirectUri);
        return getUserInfo(accessToken);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private String exchangeCode(String code, String redirectUri) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(TOKEN_URL, new HttpEntity<>(body, headers), Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody == null || !responseBody.containsKey("access_token"))
                throw new OAuthException("Failed to exchange authorization code");
            return (String) responseBody.get("access_token");
        } catch (OAuthException e) { throw e; }
        catch (Exception e) { throw new OAuthException("Failed to exchange code: " + e.getMessage(), e); }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private OAuth2UserInfo getUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(USERINFO_URL, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("email"))
                throw new OAuthException("Email not provided by OAuth provider");
            return OAuth2UserInfo.builder()
                    .sub((String) body.get("sub")).email((String) body.get("email"))
                    .name((String) body.get("name")).picture((String) body.get("picture")).build();
        } catch (OAuthException e) { throw e; }
        catch (Exception e) { throw new OAuthException("Failed to fetch user info: " + e.getMessage(), e); }
    }
}
