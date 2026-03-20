package com.equityportal.profile.dto;

import com.equityportal.persistence.entity.IncomeBracket;
import com.equityportal.persistence.entity.InvestmentExperience;
import com.equityportal.persistence.entity.NetWorthBand;
import com.equityportal.persistence.entity.RegionalPreference;
import com.equityportal.persistence.entity.RiskTolerance;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record FinancialProfileResponse(
        UUID id,
        RiskTolerance riskTolerance,
        InvestmentExperience experience,
        IncomeBracket incomeBracket,
        NetWorthBand netWorthBand,
        int horizonMonths,
        Set<RegionalPreference> regions,
        BigDecimal targetRoiPercent,
        Instant updatedAt
) {}
