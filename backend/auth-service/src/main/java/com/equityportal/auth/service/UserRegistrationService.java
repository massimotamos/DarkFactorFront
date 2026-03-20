package com.equityportal.auth.service;

import com.equityportal.auth.dto.RegistrationRequest;
import com.equityportal.auth.exception.EmailAlreadyExistsException;
import com.equityportal.auth.exception.InvalidPasswordException;
import com.equityportal.persistence.entity.UserAccount;
import com.equityportal.persistence.repository.UserAccountRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class UserRegistrationService {

    private final UserAccountRepository userAccountRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserRegistrationService(UserAccountRepository userAccountRepository,
                                   BCryptPasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserAccount register(RegistrationRequest request) {
        if (userAccountRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyExistsException(request.email());
        }

        if (request.password() == null || request.password().length() < 12) {
            throw new InvalidPasswordException();
        }

        // BCrypt silently truncates at 72 bytes — reject passwords that would be truncated
        if (request.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new InvalidPasswordException("Password must not exceed 72 bytes when encoded as UTF-8");
        }

        String passwordHash = passwordEncoder.encode(request.password());

        UserAccount account = new UserAccount();
        account.setEmail(request.email());
        account.setPasswordHash(passwordHash);
        account.setCreatedAt(Instant.now());

        return userAccountRepository.save(account);
    }
}
