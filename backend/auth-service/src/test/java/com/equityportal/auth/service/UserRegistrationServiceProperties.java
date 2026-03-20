package com.equityportal.auth.service;

import com.equityportal.auth.dto.RegistrationRequest;
import com.equityportal.persistence.entity.UserAccount;
import com.equityportal.persistence.repository.UserAccountRepository;
import net.jqwik.api.*;
import net.jqwik.api.constraints.CharRange;
import net.jqwik.api.constraints.StringLength;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Feature: equity-trading-portal, Property 1: Valid registration succeeds
@ExtendWith(MockitoExtension.class)
class UserRegistrationServiceProperties {

    // BCryptPasswordEncoder with strength 4 for test speed (real, not mocked)
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    @Property(tries = 20)
    void validRegistrationSucceeds(
            @ForAll @StringLength(min = 5, max = 50) String localPart,
            @ForAll @StringLength(min = 12, max = 64) @CharRange(from = 'A', to = 'z') String password
    ) {
        // Build a simple valid-format email from the generated local part
        String email = localPart.replaceAll("[^a-zA-Z0-9]", "a") + "@example.com";

        // Create mock per-try (jqwik does not process @ExtendWith for Mockito injection)
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        UserRegistrationService service =
                new UserRegistrationService(userAccountRepository, passwordEncoder);

        // Mock: email not yet registered (unique)
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Mock: save returns the account as-is
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount account = invocation.getArgument(0);
            return account;
        });

        RegistrationRequest request = new RegistrationRequest(email, password);
        UserAccount result = service.register(request);

        // Assert email matches
        assertThat(result.getEmail()).isEqualTo(email);

        // Assert password is hashed (not stored as plain text)
        assertThat(result.getPasswordHash()).isNotEqualTo(password);

        // Assert createdAt is set
        assertThat(result.getCreatedAt()).isNotNull();
    }
}
