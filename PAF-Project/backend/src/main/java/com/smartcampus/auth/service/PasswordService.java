package com.smartcampus.auth.service;

import java.util.List;

public interface PasswordService {
    String hash(String plaintext);
    boolean matches(String plaintext, String hash);
    List<String> validateStrength(String password);
}
