package com.smartcampus.auth.exception;

public class AccountDisabledException extends RuntimeException {
    public AccountDisabledException(String message) { super(message); }
    public AccountDisabledException(String message, Throwable cause) { super(message, cause); }
}
