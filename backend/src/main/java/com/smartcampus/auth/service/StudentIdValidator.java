package com.smartcampus.auth.service;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class StudentIdValidator {

    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile("^[A-Z]{2}[0-9]{6}$");

    /**
     * Validates a student ID against the required format: two uppercase letters followed by six digits.
     *
     * @param studentId the student ID to validate
     * @return null if valid, or a descriptive error message if invalid
     */
    public String validate(String studentId) {
        if (studentId != null && STUDENT_ID_PATTERN.matcher(studentId).matches()) {
            return null;
        }
        return "Student ID must match pattern AA000000 (two uppercase letters followed by six digits)";
    }
}
