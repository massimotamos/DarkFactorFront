package com.darkfactor.platform.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.darkfactor.platform")
public class PlatformBootApplication {
  public static void main(String[] args) {
    SpringApplication.run(PlatformBootApplication.class, args);
  }
}
