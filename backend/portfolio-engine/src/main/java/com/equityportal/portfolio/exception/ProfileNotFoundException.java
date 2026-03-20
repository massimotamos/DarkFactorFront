package com.equityportal.portfolio.exception;

public class ProfileNotFoundException extends RuntimeException {

    public ProfileNotFoundException() {
        super("Financial profile not found for user");
    }

    public ProfileNotFoundException(String message) {
        super(message);
    }
}
