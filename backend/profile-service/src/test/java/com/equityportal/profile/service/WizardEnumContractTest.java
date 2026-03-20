package com.equityportal.profile.service;

import com.equityportal.persistence.entity.*;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Validates that the enum values the Angular wizard sends over the wire
 * match the Java enum constants exactly.
 *
 * If this test fails, update wizard.component.ts option values to match.
 * If the Java enums change, update both this test and the wizard.
 */
class WizardEnumContractTest {

    // These are the exact <option value="..."> strings from wizard.component.ts
    private static final List<String> WIZARD_RISK_TOLERANCE_VALUES = List.of(
            "CONSERVATIVE", "MODERATE", "AGGRESSIVE"
    );

    private static final List<String> WIZARD_EXPERIENCE_VALUES = List.of(
            "BEGINNER", "INTERMEDIATE", "ADVANCED"
    );

    private static final List<String> WIZARD_INCOME_BRACKET_VALUES = List.of(
            "UNDER_30K", "BETWEEN_30K_60K", "BETWEEN_60K_100K", "BETWEEN_100K_200K", "OVER_200K"
    );

    private static final List<String> WIZARD_NET_WORTH_BAND_VALUES = List.of(
            "UNDER_50K", "BETWEEN_50K_250K", "BETWEEN_250K_1M", "BETWEEN_1M_5M", "OVER_5M"
    );

    private static final List<String> WIZARD_REGION_VALUES = List.of(
            "NORTH_AMERICA", "EUROPE", "ASIA_PACIFIC"
    );

    @Test
    void riskToleranceWizardValues_matchJavaEnum() {
        List<String> javaValues = Arrays.stream(RiskTolerance.values())
                .map(Enum::name).collect(Collectors.toList());
        assertThat(javaValues)
                .as("RiskTolerance Java enum must contain all wizard option values")
                .containsAll(WIZARD_RISK_TOLERANCE_VALUES);
    }

    @Test
    void investmentExperienceWizardValues_matchJavaEnum() {
        List<String> javaValues = Arrays.stream(InvestmentExperience.values())
                .map(Enum::name).collect(Collectors.toList());
        assertThat(javaValues)
                .as("InvestmentExperience Java enum must contain all wizard option values")
                .containsAll(WIZARD_EXPERIENCE_VALUES);
    }

    @Test
    void incomeBracketWizardValues_matchJavaEnum() {
        List<String> javaValues = Arrays.stream(IncomeBracket.values())
                .map(Enum::name).collect(Collectors.toList());
        assertThat(javaValues)
                .as("IncomeBracket Java enum must contain all wizard option values. " +
                    "If this fails, update wizard.component.ts <option value> to match Java enum names.")
                .containsAll(WIZARD_INCOME_BRACKET_VALUES);
    }

    @Test
    void netWorthBandWizardValues_matchJavaEnum() {
        List<String> javaValues = Arrays.stream(NetWorthBand.values())
                .map(Enum::name).collect(Collectors.toList());
        assertThat(javaValues)
                .as("NetWorthBand Java enum must contain all wizard option values. " +
                    "If this fails, update wizard.component.ts <option value> to match Java enum names.")
                .containsAll(WIZARD_NET_WORTH_BAND_VALUES);
    }

    @Test
    void regionWizardValues_matchJavaEnum() {
        List<String> javaValues = Arrays.stream(RegionalPreference.values())
                .map(Enum::name).collect(Collectors.toList());
        assertThat(javaValues)
                .as("RegionalPreference Java enum must contain all wizard option values")
                .containsAll(WIZARD_REGION_VALUES);
    }
}
