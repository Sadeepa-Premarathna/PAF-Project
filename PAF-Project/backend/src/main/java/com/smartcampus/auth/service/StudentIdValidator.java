package com.smartcampus.auth.service;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class StudentIdValidator {

    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile("^[A-Z]{2}[0-9]{6}$");

    public String validate(String studentId) {
        if (studentId != null && !studentId.trim().isEmpty()) {
            return null;
        }
        return "Student ID is required";
    }
}
