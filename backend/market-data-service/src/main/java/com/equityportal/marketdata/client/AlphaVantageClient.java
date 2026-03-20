package com.equityportal.marketdata.client;

import com.equityportal.marketdata.dto.OhlcvBar;
import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.marketdata.exception.MarketDataUnavailableException;
import com.equityportal.marketdata.exception.TickerNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Component
public class AlphaVantageClient implements MarketDataProvider {

    private static final String BASE_URL = "https://www.alphavantage.co";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final WebClient webClient;
    private final String apiKey;

    public AlphaVantageClient(WebClient.Builder webClientBuilder,
                               @Value("${alphavantage.api-key:demo}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl(BASE_URL).build();
        this.apiKey = apiKey;
    }

    @Override
    public QuoteDto fetchQuote(String ticker) {
        try {
            JsonNode root = webClient.get()
                    .uri("/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={apiKey}", ticker, apiKey)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return parseQuote(ticker, root);
        } catch (WebClientResponseException e) {
            throw new MarketDataUnavailableException(
                    "Alpha Vantage returned HTTP " + e.getStatusCode() + " for ticker: " + ticker, e);
        } catch (TickerNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new MarketDataUnavailableException(
                    "Failed to fetch quote from Alpha Vantage for ticker: " + ticker, e);
        }
    }

    @Override
    public List<OhlcvBar> fetchHistory(String ticker, LocalDate from, LocalDate to) {
        try {
            JsonNode root = webClient.get()
                    .uri("/query?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={apiKey}&outputsize=full",
                            ticker, apiKey)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return parseHistory(ticker, root, from, to);
        } catch (WebClientResponseException e) {
            throw new MarketDataUnavailableException(
                    "Alpha Vantage returned HTTP " + e.getStatusCode() + " for ticker: " + ticker, e);
        } catch (TickerNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new MarketDataUnavailableException(
                    "Failed to fetch history from Alpha Vantage for ticker: " + ticker, e);
        }
    }

    private QuoteDto parseQuote(String ticker, JsonNode root) {
        if (root == null) {
            throw new MarketDataUnavailableException("Empty response from Alpha Vantage for ticker: " + ticker);
        }

        // Alpha Vantage returns an "Information" field when rate-limited or API key is invalid
        JsonNode information = root.path("Information");
        if (!information.isMissingNode() && !information.isNull()) {
            throw new MarketDataUnavailableException(
                    "Alpha Vantage API error for ticker " + ticker + ": " + information.asText());
        }

        JsonNode globalQuote = root.path("Global Quote");
        if (globalQuote.isMissingNode() || globalQuote.isNull() || globalQuote.isEmpty()) {
            throw new TickerNotFoundException(ticker);
        }

        JsonNode priceNode = globalQuote.path("05. price");
        if (priceNode.isMissingNode() || priceNode.isNull() || priceNode.asText().isBlank()) {
            throw new TickerNotFoundException(ticker);
        }

        BigDecimal price = new BigDecimal(priceNode.asText());
        // Alpha Vantage free tier doesn't return currency; default to USD
        String currency = "USD";
        Instant timestamp = Instant.now();

        return new QuoteDto(ticker, price, currency, timestamp);
    }

    private List<OhlcvBar> parseHistory(String ticker, JsonNode root, LocalDate from, LocalDate to) {
        if (root == null) {
            throw new MarketDataUnavailableException("Empty response from Alpha Vantage for ticker: " + ticker);
        }

        JsonNode information = root.path("Information");
        if (!information.isMissingNode() && !information.isNull()) {
            throw new MarketDataUnavailableException(
                    "Alpha Vantage API error for ticker " + ticker + ": " + information.asText());
        }

        JsonNode timeSeries = root.path("Time Series (Daily)");
        if (timeSeries.isMissingNode() || timeSeries.isNull() || timeSeries.isEmpty()) {
            throw new TickerNotFoundException(ticker);
        }

        List<OhlcvBar> bars = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            LocalDate date = LocalDate.parse(entry.getKey(), DATE_FMT);

            if (date.isBefore(from) || date.isAfter(to)) {
                continue;
            }

            JsonNode day = entry.getValue();
            bars.add(new OhlcvBar(
                    date,
                    new BigDecimal(day.path("1. open").asText("0")),
                    new BigDecimal(day.path("2. high").asText("0")),
                    new BigDecimal(day.path("3. low").asText("0")),
                    new BigDecimal(day.path("4. close").asText("0")),
                    Long.parseLong(day.path("5. volume").asText("0"))
            ));
        }

        bars.sort((a, b) -> a.date().compareTo(b.date()));
        return bars;
    }
}
