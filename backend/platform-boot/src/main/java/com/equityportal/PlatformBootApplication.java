package com.equityportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.equityportal")
@EnableScheduling
public class PlatformBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformBootApplication.class, args);
    }
}
