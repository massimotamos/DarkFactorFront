package com.equityportal.marketdata.client;

import com.equityportal.marketdata.dto.QuoteDto;
import com.equityportal.marketdata.exception.MarketDataUnavailableException;
import com.equityportal.marketdata.exception.TickerNotFoundException;
import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.web.reactive.function.client.WebClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * WireMock-based tests for {@link YahooFinanceClient}.
 * Validates HTTP response handling: successful quote, 500 → unavailable, 404 → not found.
 */
class YahooFinanceClientWireMockTest {

    @RegisterExtension
    static WireMockExtension wireMock = WireMockExtension.newInstance()
            .options(wireMockConfig().dynamicPort())
            .build();

    private YahooFinanceClient buildClient() {
        return new YahooFinanceClient(WebClient.builder(), "http://localhost:" + wireMock.getPort());
    }

    @Test
    void fetchQuote_returnsQuote_whenYahooRespondsSuccessfully() {
        wireMock.stubFor(get(urlPathEqualTo("/v8/finance/chart/AAPL"))
                .withQueryParam("interval", equalTo("1d"))
                .withQueryParam("range", equalTo("1d"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"chart\":{\"result\":[{\"meta\":{\"regularMarketPrice\":182.50," +
                                "\"currency\":\"USD\",\"regularMarketTime\":1705312800}}],\"error\":null}}")));

        YahooFinanceClient client = buildClient();
        QuoteDto quote = client.fetchQuote("AAPL");

        assertThat(quote).isNotNull();
        assertThat(quote.ticker()).isEqualTo("AAPL");
        assertThat(quote.price()).isNotNull();
        assertThat(quote.price().doubleValue()).isEqualTo(182.50);
    }

    @Test
    void fetchQuote_throwsMarketDataUnavailableException_whenYahooReturns500() {
        wireMock.stubFor(get(urlPathEqualTo("/v8/finance/chart/AAPL"))
                .willReturn(aResponse().withStatus(500)));

        YahooFinanceClient client = buildClient();

        assertThatThrownBy(() -> client.fetchQuote("AAPL"))
                .isInstanceOf(MarketDataUnavailableException.class);
    }

    @Test
    void fetchQuote_throwsTickerNotFoundException_whenYahooReturns404() {
        wireMock.stubFor(get(urlPathEqualTo("/v8/finance/chart/INVALID"))
                .willReturn(aResponse().withStatus(404)));

        YahooFinanceClient client = buildClient();

        assertThatThrownBy(() -> client.fetchQuote("INVALID"))
                .isInstanceOf(TickerNotFoundException.class);
    }
}
