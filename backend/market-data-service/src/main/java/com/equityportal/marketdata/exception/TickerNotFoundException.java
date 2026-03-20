package com.equityportal.marketdata.exception;

public class TickerNotFoundException extends RuntimeException {

    public TickerNotFoundException(String ticker) {
        super("Ticker not found: " + ticker);
    }

    public TickerNotFoundException(String ticker, Throwable cause) {
        super("Ticker not found: " + ticker, cause);
    }
}
