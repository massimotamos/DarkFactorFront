package com.equityportal.profile.dto;

import com.equityportal.persistence.entity.IncomeBracket;
import com.equityportal.persistence.entity.InvestmentExperience;
import com.equityportal.persistence.entity.NetWorthBand;
import com.equityportal.persistence.entity.RegionalPreference;
import com.equityportal.persistence.entity.RiskTolerance;

import java.math.BigDecimal;
import java.util.Set;

public record FinancialProfileRequest(
        RiskTolerance riskTolerance,
        InvestmentExperience experience,
        IncomeBracket incomeBracket,
        NetWorthBand netWorthBand,
        int horizonMonths,
        Set<RegionalPreference> regions,
        BigDecimal targetRoiPercent
) {}
