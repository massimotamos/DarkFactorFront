package com.equityportal.auth.exception;

public class InvalidPasswordException extends RuntimeException {

    public InvalidPasswordException() {
        super("Password must be at least 12 characters long");
    }

    public InvalidPasswordException(String message) {
        super(message);
    }
}
