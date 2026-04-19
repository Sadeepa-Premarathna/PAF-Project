package com.smartcampus.auth.service;

import org.springframework.stereotype.Component;

@Component
public class StudentIdValidator {


    public String validate(String studentId) {
        if (studentId == null || studentId.trim().isEmpty()) {
            return "Student ID is required";
        }
        return null;
    }
}
