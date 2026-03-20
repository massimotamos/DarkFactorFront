package com.equityportal.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Minimal Spring Boot entry point used only during integration tests in platform-rest-api.
 * The real entry point lives in platform-boot; this avoids a cross-module dependency
 * while still allowing @SpringBootTest to locate a @SpringBootConfiguration.
 */
@SpringBootApplication(scanBasePackages = "com.equityportal")
public class TestPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestPlatformApplication.class, args);
    }
}
