package com.equityportal.marketdata.client;

import com.equityportal.marketdata.dto.OhlcvBar;
import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.marketdata.exception.MarketDataUnavailableException;
import com.equityportal.marketdata.exception.TickerNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Component
public class YahooFinanceClient implements MarketDataProvider {

    private static final String BASE_URL = "https://query1.finance.yahoo.com";

    private final WebClient webClient;

    @Autowired
    public YahooFinanceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(BASE_URL).build();
    }

    /** Package-private constructor for testing with a custom base URL. */
    YahooFinanceClient(WebClient.Builder webClientBuilder, String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    @Override
    public QuoteDto fetchQuote(String ticker) {
        try {
            JsonNode root = webClient.get()
                    .uri("/v8/finance/chart/{ticker}?interval=1d&range=1d", ticker)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return parseQuote(ticker, root);
        } catch (WebClientResponseException.NotFound e) {
            throw new TickerNotFoundException(ticker, e);
        } catch (WebClientResponseException e) {
            throw new MarketDataUnavailableException(
                    "Yahoo Finance returned HTTP " + e.getStatusCode() + " for ticker: " + ticker, e);
        } catch (TickerNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new MarketDataUnavailableException(
                    "Failed to fetch quote from Yahoo Finance for ticker: " + ticker, e);
        }
    }

    @Override
    public List<OhlcvBar> fetchHistory(String ticker, LocalDate from, LocalDate to) {
        long fromEpoch = from.atStartOfDay(ZoneOffset.UTC).toEpochSecond();
        long toEpoch = to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toEpochSecond();

        try {
            JsonNode root = webClient.get()
                    .uri("/v8/finance/chart/{ticker}?interval=1d&period1={from}&period2={to}",
                            ticker, fromEpoch, toEpoch)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return parseHistory(ticker, root);
        } catch (WebClientResponseException.NotFound e) {
            throw new TickerNotFoundException(ticker, e);
        } catch (WebClientResponseException e) {
            throw new MarketDataUnavailableException(
                    "Yahoo Finance returned HTTP " + e.getStatusCode() + " for ticker: " + ticker, e);
        } catch (TickerNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new MarketDataUnavailableException(
                    "Failed to fetch history from Yahoo Finance for ticker: " + ticker, e);
        }
    }

    private QuoteDto parseQuote(String ticker, JsonNode root) {
        JsonNode result = getChartResult(ticker, root);
        JsonNode meta = result.path("meta");

        if (meta.isMissingNode() || meta.isNull()) {
            throw new TickerNotFoundException(ticker);
        }

        JsonNode priceNode = meta.path("regularMarketPrice");
        if (priceNode.isMissingNode() || priceNode.isNull()) {
            throw new TickerNotFoundException(ticker);
        }

        BigDecimal price = priceNode.decimalValue();
        String currency = meta.path("currency").asText("USD");
        long epochSeconds = meta.path("regularMarketTime").asLong(Instant.now().getEpochSecond());
        Instant timestamp = Instant.ofEpochSecond(epochSeconds);

        return new QuoteDto(ticker, price, currency, timestamp);
    }

    private List<OhlcvBar> parseHistory(String ticker, JsonNode root) {
        JsonNode result = getChartResult(ticker, root);

        JsonNode timestamps = result.path("timestamp");
        JsonNode indicators = result.path("indicators").path("quote").path(0);

        if (timestamps.isMissingNode() || timestamps.isEmpty()) {
            return List.of();
        }

        JsonNode opens = indicators.path("open");
        JsonNode highs = indicators.path("high");
        JsonNode lows = indicators.path("low");
        JsonNode closes = indicators.path("close");
        JsonNode volumes = indicators.path("volume");

        List<OhlcvBar> bars = new ArrayList<>();
        for (int i = 0; i < timestamps.size(); i++) {
            long epochSec = timestamps.get(i).asLong();
            LocalDate date = Instant.ofEpochSecond(epochSec).atZone(ZoneOffset.UTC).toLocalDate();

            JsonNode openNode = opens.path(i);
            JsonNode highNode = highs.path(i);
            JsonNode lowNode = lows.path(i);
            JsonNode closeNode = closes.path(i);
            JsonNode volumeNode = volumes.path(i);

            // Skip bars with null values (e.g. non-trading days)
            if (openNode.isNull() || closeNode.isNull()) {
                continue;
            }

            bars.add(new OhlcvBar(
                    date,
                    openNode.decimalValue(),
                    highNode.decimalValue(),
                    lowNode.decimalValue(),
                    closeNode.decimalValue(),
                    volumeNode.asLong(0)
            ));
        }
        return bars;
    }

    private JsonNode getChartResult(String ticker, JsonNode root) {
        if (root == null) {
            throw new MarketDataUnavailableException("Empty response from Yahoo Finance for ticker: " + ticker);
        }

        JsonNode error = root.path("chart").path("error");
        if (!error.isNull() && !error.isMissingNode()) {
            String code = error.path("code").asText("");
            if ("Not Found".equalsIgnoreCase(code) || "No fundamentals data found".equalsIgnoreCase(code)) {
                throw new TickerNotFoundException(ticker);
            }
            throw new MarketDataUnavailableException("Yahoo Finance error for ticker " + ticker + ": " + error);
        }

        JsonNode results = root.path("chart").path("result");
        if (results.isMissingNode() || results.isNull() || results.isEmpty()) {
            throw new TickerNotFoundException(ticker);
        }

        return results.path(0);
    }
}
