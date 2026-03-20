package com.equityportal.auth.exception;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("Email address already registered: " + email);
    }
}
