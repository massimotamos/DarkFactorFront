package com.equityportal.profile.exception;

public class ProfileNotFoundException extends RuntimeException {

    public ProfileNotFoundException() {
        super("Financial profile not found");
    }

    public ProfileNotFoundException(String message) {
        super(message);
    }
}
