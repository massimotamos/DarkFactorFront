package com.equityportal.api.exception;

import net.jqwik.api.*;
import org.assertj.core.api.Assertions;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Property 30: Unhandled exceptions return generic 500.
 *
 * Validates: Requirements 10.7
 *
 * Verifies that the GlobalExceptionHandler:
 * - Returns HTTP 500 for any unhandled exception
 * - Includes a correlationId in the response body
 * - Never exposes the exception message or stack trace
 */
class GlobalExceptionHandlerProperties {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Property
    @Label("Property 30: Any unhandled exception returns HTTP 500")
    void unhandledExceptionReturns500(@ForAll("arbitraryExceptions") Exception ex) {
        ResponseEntity<Map<String, Object>> response = handler.handleUnexpected(ex);

        Assertions.assertThat(response.getStatusCode())
                .as("Status should be 500 for exception: %s", ex.getClass().getSimpleName())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Property
    @Label("Property 30: Response body contains correlationId")
    void responseBodyContainsCorrelationId(@ForAll("arbitraryExceptions") Exception ex) {
        ResponseEntity<Map<String, Object>> response = handler.handleUnexpected(ex);

        Assertions.assertThat(response.getBody())
                .as("Response body should not be null")
                .isNotNull();
        Assertions.assertThat(response.getBody())
                .containsKey("correlationId");
        Assertions.assertThat(response.getBody().get("correlationId").toString())
                .as("correlationId should be a non-empty UUID string")
                .isNotBlank()
                .matches("[0-9a-f-]{36}");
    }

    @Property
    @Label("Property 30: Response body does not expose exception message or stack trace")
    void responseBodyDoesNotExposeInternals(@ForAll("arbitraryExceptions") Exception ex) {
        ResponseEntity<Map<String, Object>> response = handler.handleUnexpected(ex);

        String bodyStr = response.getBody() != null ? response.getBody().toString() : "";

        // The exception message should NOT appear in the response
        if (ex.getMessage() != null && !ex.getMessage().isBlank()) {
            Assertions.assertThat(bodyStr)
                    .as("Exception message should not be exposed in response")
                    .doesNotContain(ex.getMessage());
        }

        // No stack trace keywords
        Assertions.assertThat(bodyStr)
                .doesNotContain("at com.")
                .doesNotContain("StackTrace")
                .doesNotContain("Exception");
    }

    @Provide
    Arbitrary<Exception> arbitraryExceptions() {
        return Arbitraries.of(
                new RuntimeException("internal db error"),
                new NullPointerException("null ref"),
                new IllegalStateException("bad state"),
                new RuntimeException("sensitive: password=secret123"),
                new RuntimeException(),
                new UnsupportedOperationException("not implemented"),
                new RuntimeException("SELECT * FROM users WHERE id=1")
        );
    }
}
