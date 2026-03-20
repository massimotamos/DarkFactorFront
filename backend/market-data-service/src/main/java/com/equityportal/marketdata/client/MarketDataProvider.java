package com.equityportal.marketdata.client;

import com.equityportal.marketdata.dto.OhlcvBar;
import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.marketdata.exception.MarketDataUnavailableException;

import java.time.LocalDate;
import java.util.List;

public interface MarketDataProvider {

    /**
     * Fetch the latest price quote for the given ticker.
     *
     * @param ticker the instrument ticker symbol
     * @return a QuoteDto with current price, currency, and timestamp
     * @throws MarketDataUnavailableException if the provider is unreachable or returns an error
     */
    QuoteDto fetchQuote(String ticker);

    /**
     * Fetch daily OHLCV history for the given ticker over the specified date range.
     *
     * @param ticker the instrument ticker symbol
     * @param from   start date (inclusive)
     * @param to     end date (inclusive)
     * @return list of OhlcvBar records ordered by date ascending
     * @throws MarketDataUnavailableException if the provider is unreachable or returns an error
     */
    List<OhlcvBar> fetchHistory(String ticker, LocalDate from, LocalDate to);
}
