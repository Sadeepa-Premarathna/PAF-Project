package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.service.PasswordService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PasswordServiceImpl implements PasswordService {

    private static final int MIN_LENGTH = 6;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public String hash(String plaintext) {
        return encoder.encode(plaintext);
    }

    @Override
    public boolean matches(String plaintext, String hash) {
        return encoder.matches(plaintext, hash);
    }

    @Override
    public List<String> validateStrength(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.length() < MIN_LENGTH) {
            errors.add("Password must be at least 6 characters long");
        }

        if (password == null || password.chars().noneMatch(Character::isLetter)) {
            errors.add("Password must contain at least one letter");
        }

        if (password == null || password.chars().noneMatch(Character::isDigit)) {
            errors.add("Password must contain at least one digit");
        }

        return errors;
    }
}
