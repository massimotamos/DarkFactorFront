package com.equityportal.auth.service;

import com.equityportal.auth.dto.RegistrationRequest;
import com.equityportal.auth.exception.InvalidPasswordException;
import com.equityportal.persistence.repository.UserAccountRepository;
import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// Feature: equity-trading-portal, Property 2: Short password rejected
@ExtendWith(MockitoExtension.class)
class UserRegistrationServiceShortPasswordProperties {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    /**
     * Validates: Requirements 1.3
     *
     * For any password of length 0–11, register() must throw InvalidPasswordException.
     */
    @Property(tries = 100)
    void shortPasswordIsRejected(
            @ForAll @StringLength(min = 0, max = 11) String shortPassword
    ) {
        UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
        UserRegistrationService service =
                new UserRegistrationService(userAccountRepository, passwordEncoder);

        // Email is not the subject under test; mock the repo to return empty so the
        // duplicate-email check passes and we reach the password validation.
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        RegistrationRequest request = new RegistrationRequest("user@example.com", shortPassword);

        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("12");
    }
}
