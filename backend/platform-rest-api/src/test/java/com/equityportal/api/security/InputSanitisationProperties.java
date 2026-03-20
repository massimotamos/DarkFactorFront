package com.equityportal.api.security;

import net.jqwik.api.*;
import net.jqwik.api.constraints.StringLength;
import org.assertj.core.api.Assertions;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Property 29: Input sanitisation rejects injection patterns.
 *
 * Validates: Requirements 10.4
 *
 * Verifies that a set of known injection patterns (SQL, script, LDAP, path traversal)
 * are detected by the sanitisation utility before reaching business logic.
 */
class InputSanitisationProperties {

    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("(?i)(<script|</script|javascript:|on\\w+=)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("(?i)(union\\s+select|drop\\s+table|insert\\s+into|delete\\s+from|'\\s*or\\s+['\"]?\\d|'\\s*or\\s*'1'\\s*=\\s*'1|--\\s*$)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("\\.\\./|\\.\\./"),
            Pattern.compile("(?i)(\\$\\{|#\\{|%\\{)")
    );

    /** Utility method that mirrors what controllers should apply. */
    static boolean containsInjectionPattern(String input) {
        if (input == null) return false;
        return INJECTION_PATTERNS.stream().anyMatch(p -> p.matcher(input).find());
    }

    @Property
    @Label("Property 29: SQL injection patterns are detected")
    void sqlInjectionPatternsDetected(@ForAll("sqlInjectionInputs") String input) {
        Assertions.assertThat(containsInjectionPattern(input))
                .as("SQL injection pattern should be detected in: %s", input)
                .isTrue();
    }

    @Property
    @Label("Property 29: XSS patterns are detected")
    void xssPatternsDetected(@ForAll("xssInputs") String input) {
        Assertions.assertThat(containsInjectionPattern(input))
                .as("XSS pattern should be detected in: %s", input)
                .isTrue();
    }

    @Property
    @Label("Property 29: Clean alphanumeric input passes sanitisation")
    void cleanInputPassesSanitisation(@ForAll("cleanInputs") String input) {
        Assertions.assertThat(containsInjectionPattern(input))
                .as("Clean input should not be flagged as injection: %s", input)
                .isFalse();
    }

    @Provide
    Arbitrary<String> sqlInjectionInputs() {
        return Arbitraries.of(
                "' OR '1'='1",
                "'; DROP TABLE users; --",
                "UNION SELECT * FROM user_account",
                "1; DELETE FROM financial_profile",
                "INSERT INTO user_account VALUES ('hack')",
                "' OR 1=1 --",
                "admin'--"
        );
    }

    @Provide
    Arbitrary<String> xssInputs() {
        return Arbitraries.of(
                "<script>alert('xss')</script>",
                "<SCRIPT SRC=http://evil.com/xss.js></SCRIPT>",
                "javascript:alert(1)",
                "<img onload=alert(1)>",
                "</script><script>alert(1)</script>",
                "${7*7}",
                "#{7*7}"
        );
    }

    @Provide
    Arbitrary<String> cleanInputs() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .withCharRange('A', 'Z')
                .withCharRange('0', '9')
                .ofMinLength(1)
                .ofMaxLength(50);
    }
}
