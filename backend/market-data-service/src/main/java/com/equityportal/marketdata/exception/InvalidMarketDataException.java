package com.equityportal.marketdata.exception;

public class InvalidMarketDataException extends RuntimeException {

    public InvalidMarketDataException(String message) {
        super(message);
    }

    public InvalidMarketDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
