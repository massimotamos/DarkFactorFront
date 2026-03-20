import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, Subscription } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { JwtService } from '../../core/jwt.service';

export interface PriceUpdate {
  ticker: string;
  price: number;
  currency: string;
  timestamp: string;
  stale: boolean;
}

export interface QuoteSnapshot {
  ticker: string;
  price: number;
  currency: string;
  timestamp: string;
  stale: boolean;
  cachedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MarketDataService implements OnDestroy {

  private stompClient: Client | null = null;
  private priceSubjects = new Map<string, Subject<PriceUpdate>>();
  private pollSubscriptions = new Map<string, Subscription>();
  private _usingFallback = false;

  get usingFallback(): boolean { return this._usingFallback; }

  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) {}

  getQuote(ticker: string): Observable<QuoteSnapshot> {
    return this.http.get<QuoteSnapshot>(`/api/market-data/quote/${ticker}`);
  }

  getHistory(ticker: string, from: string, to: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`/api/market-data/history/${ticker}?from=${from}&to=${to}`);
  }

  subscribeToPrice(ticker: string): Observable<PriceUpdate> {
    if (!this.priceSubjects.has(ticker)) {
      this.priceSubjects.set(ticker, new Subject<PriceUpdate>());
    }
    this.ensureConnected(ticker);
    return this.priceSubjects.get(ticker)!.asObservable();
  }

  private ensureConnected(ticker: string): void {
    if (this.stompClient?.connected) {
      this.subscribeToTopic(ticker);
      return;
    }

    const token = this.jwtService.getAccessToken();
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('/ws/market-data'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        this._usingFallback = false;
        this.stopPolling(ticker);
        this.subscribeToTopic(ticker);
      },
      onDisconnect: () => {
        this._usingFallback = true;
        this.startPolling(ticker);
      },
      onStompError: () => {
        this._usingFallback = true;
        this.startPolling(ticker);
      }
    });
    this.stompClient.activate();
  }

  private subscribeToTopic(ticker: string): void {
    this.stompClient?.subscribe(`/topic/prices/${ticker}`, (msg: IMessage) => {
      try {
        const update: PriceUpdate = JSON.parse(msg.body);
        this.priceSubjects.get(ticker)?.next(update);
      } catch { /* ignore malformed messages */ }
    });
  }

  private startPolling(ticker: string): void {
    if (this.pollSubscriptions.has(ticker)) return;
    const sub = interval(60_000).subscribe(() => {
      this.getQuote(ticker).subscribe({
        next: (q) => this.priceSubjects.get(ticker)?.next({
          ticker: q.ticker,
          price: q.price,
          currency: q.currency,
          timestamp: q.timestamp,
          stale: q.stale
        }),
        error: () => {}
      });
    });
    this.pollSubscriptions.set(ticker, sub);
  }

  private stopPolling(ticker: string): void {
    this.pollSubscriptions.get(ticker)?.unsubscribe();
    this.pollSubscriptions.delete(ticker);
  }

  ngOnDestroy(): void {
    this.stompClient?.deactivate();
    this.pollSubscriptions.forEach(s => s.unsubscribe());
    this.priceSubjects.forEach(s => s.complete());
  }
}
