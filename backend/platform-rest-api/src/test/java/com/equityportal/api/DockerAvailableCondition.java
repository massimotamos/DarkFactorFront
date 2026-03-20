package com.equityportal.api;

import org.junit.jupiter.api.extension.ConditionEvaluationResult;
import org.junit.jupiter.api.extension.ExecutionCondition;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.DockerClientFactory;

/**
 * JUnit 5 execution condition that skips tests when no Docker environment is reachable.
 * Allows the build to stay green on machines without Docker Desktop or a remote Docker host.
 */
public class DockerAvailableCondition implements ExecutionCondition {

    @Override
    public ConditionEvaluationResult evaluateExecutionCondition(ExtensionContext context) {
        try {
            DockerClientFactory.instance().client();
            return ConditionEvaluationResult.enabled("Docker is available");
        } catch (Exception e) {
            return ConditionEvaluationResult.disabled(
                    "Docker not available — skipping integration test: " + e.getMessage());
        }
    }
}
