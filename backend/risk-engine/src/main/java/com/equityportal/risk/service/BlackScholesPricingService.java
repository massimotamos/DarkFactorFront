package com.equityportal.risk.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Computes European call and put option prices using the Black-Scholes formula.
 */
@Service
public class BlackScholesPricingService {

    /**
     * Computes the Black-Scholes price for a European call option.
     *
     * @param spot             current spot price (S)
     * @param strike           strike price (K)
     * @param volatility       annualised implied volatility (σ)
     * @param riskFreeRate     continuously-compounded risk-free rate (r)
     * @param timeToExpiryYears time to expiry in years (T)
     * @return call price rounded to 6 decimal places
     */
    public BigDecimal callPrice(BigDecimal spot, BigDecimal strike, BigDecimal volatility,
                                BigDecimal riskFreeRate, BigDecimal timeToExpiryYears) {
        double S = spot.doubleValue();
        double K = strike.doubleValue();
        double sigma = volatility.doubleValue();
        double r = riskFreeRate.doubleValue();
        double T = timeToExpiryYears.doubleValue();

        double[] d = computeD1D2(S, K, sigma, r, T);
        double d1 = d[0];
        double d2 = d[1];

        double call = S * normalCdf(d1) - K * Math.exp(-r * T) * normalCdf(d2);
        return BigDecimal.valueOf(call).setScale(6, RoundingMode.HALF_UP);
    }

    /**
     * Computes the Black-Scholes price for a European put option.
     *
     * @param spot             current spot price (S)
     * @param strike           strike price (K)
     * @param volatility       annualised implied volatility (σ)
     * @param riskFreeRate     continuously-compounded risk-free rate (r)
     * @param timeToExpiryYears time to expiry in years (T)
     * @return put price rounded to 6 decimal places
     */
    public BigDecimal putPrice(BigDecimal spot, BigDecimal strike, BigDecimal volatility,
                               BigDecimal riskFreeRate, BigDecimal timeToExpiryYears) {
        double S = spot.doubleValue();
        double K = strike.doubleValue();
        double sigma = volatility.doubleValue();
        double r = riskFreeRate.doubleValue();
        double T = timeToExpiryYears.doubleValue();

        double[] d = computeD1D2(S, K, sigma, r, T);
        double d1 = d[0];
        double d2 = d[1];

        double put = K * Math.exp(-r * T) * normalCdf(-d2) - S * normalCdf(-d1);
        return BigDecimal.valueOf(put).setScale(6, RoundingMode.HALF_UP);
    }

    // d1 = (ln(S/K) + (r + σ²/2) * T) / (σ * √T)
    // d2 = d1 - σ * √T
    private double[] computeD1D2(double S, double K, double sigma, double r, double T) {
        double sqrtT = Math.sqrt(T);
        double d1 = (Math.log(S / K) + (r + sigma * sigma / 2.0) * T) / (sigma * sqrtT);
        double d2 = d1 - sigma * sqrtT;
        return new double[]{d1, d2};
    }

    /**
     * Normal CDF approximation using Abramowitz and Stegun method.
     */
    private static double normalCdf(double x) {
        double t = 1.0 / (1.0 + 0.2316419 * Math.abs(x));
        double d = 0.3989422820 * Math.exp(-x * x / 2.0);
        double p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
        return x >= 0 ? 1.0 - p : p;
    }
}
