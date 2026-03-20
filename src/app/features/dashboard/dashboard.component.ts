import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PortfolioService, PortfolioRecommendation } from './portfolio.service';
import { MarketDataService, PriceUpdate } from './market-data.service';
import { Chart, ArcElement, DoughnutController, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Tooltip, Legend);

interface LivePrice {
  ticker: string;
  price: number;
  stale: boolean;
  updatedAt: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <header>
        <h2>Portfolio Dashboard</h2>
        <a routerLink="/history">View History</a>
        <button (click)="generateNew()" [disabled]="generating">
          {{ generating ? 'Generating…' : 'New Recommendation' }}
        </button>
      </header>

      <!-- Error banner -->
      <div class="banner error" *ngIf="errorMessage">
        {{ errorMessage }}
        <a *ngIf="needsProfile" routerLink="/wizard" style="margin-left:0.5rem; font-weight:bold;">Complete your profile →</a>
      </div>

      <!-- Fallback banner -->
      <div class="banner warn" *ngIf="marketDataService.usingFallback">
        Live updates paused — using 60s polling fallback.
      </div>

      <!-- Staleness banner -->
      <div class="banner warn" *ngIf="isStale">
        Market data may be stale. Prices last updated over 2 minutes ago.
      </div>

      <!-- Data warning -->
      <div class="banner info" *ngIf="recommendation?.dataWarning">
        {{ recommendation!.dataWarning }}
      </div>

      <div *ngIf="!recommendation" class="empty">
        No portfolio yet. Click "New Recommendation" to get started.
      </div>

      <div *ngIf="recommendation" class="content">
        <div class="chart-section">
          <canvas #donutCanvas width="300" height="300"></canvas>
        </div>

        <div class="allocation-section">
          <h3>Allocations</h3>
          <table>
            <thead>
              <tr>
                <th>Instrument</th>
                <th>Weight %</th>
                <th>Price at Generation</th>
                <th>Live Price</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alloc of recommendation.allocations">
                <td>{{ alloc.instrumentId }}</td>
                <td>{{ alloc.weightPercent | number:'1.2-2' }}%</td>
                <td>{{ alloc.priceAtGeneration | number:'1.2-2' }}</td>
                <td [class.stale]="getLivePrice(alloc.instrumentId)?.stale">
                  {{ getLivePrice(alloc.instrumentId)?.price !== undefined ? (getLivePrice(alloc.instrumentId)!.price | number:'1.2-2') : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="meta">
          <p>Expected Return: {{ recommendation.expectedReturnPercent }}%</p>
          <p>Volatility: {{ recommendation.volatilityPercent }}%</p>
          <p>Generated: {{ recommendation.generatedAt | date:'medium' }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1.5rem; }
    header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .banner { padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; }
    .banner.warn { background: #fff3e0; border-left: 4px solid #f57c00; }
    .banner.info { background: #e3f2fd; border-left: 4px solid #1976d2; }
    .content { display: grid; grid-template-columns: 320px 1fr; gap: 2rem; }
    .chart-section { display: flex; justify-content: center; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
    td.stale { color: #f57c00; }
    .meta { grid-column: 1 / -1; }
    .banner.error { background: #fce4ec; border-left: 4px solid #c62828; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  recommendation: PortfolioRecommendation | null = null;
  livePrices = new Map<string, LivePrice>();
  isStale = false;
  generating = false;
  errorMessage: string | null = null;
  needsProfile = false;

  private subscriptions: Subscription[] = [];
  private chart: Chart | null = null;
  private stalenessTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    public marketDataService: MarketDataService,
    private portfolioService: PortfolioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.portfolioService.getHistory().subscribe({
      next: (history) => {
        if (history.length > 0) {
          this.recommendation = history[0];
          this.subscribeToLivePrices();
        }
      },
      error: () => {
        // History fetch failed — non-fatal, user can still generate a new recommendation
      }
    });

    this.stalenessTimer = setInterval(() => this.checkStaleness(), 10_000);
  }

  ngAfterViewInit(): void {
    if (this.recommendation) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.chart?.destroy();
    if (this.stalenessTimer) clearInterval(this.stalenessTimer);
  }

  generateNew(): void {
    this.generating = true;
    this.errorMessage = null;
    this.needsProfile = false;
    this.portfolioService.generateRecommendation().subscribe({
      next: (rec) => {
        this.recommendation = rec;
        this.generating = false;
        this.subscribeToLivePrices();
        setTimeout(() => this.renderChart(), 0);
      },
      error: (err) => {
        this.generating = false;
        if (err.status === 404) {
          this.needsProfile = true;
          this.errorMessage = 'No financial profile found. Please complete the profile wizard first.';
          this.router.navigate(['/wizard']);
        } else {
          this.errorMessage = 'Failed to generate recommendation. Please try again.';
        }
      }
    });
  }

  getLivePrice(instrumentId: string): LivePrice | undefined {
    return this.livePrices.get(instrumentId);
  }

  private subscribeToLivePrices(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];

    this.recommendation?.allocations.forEach(alloc => {
      const sub = this.marketDataService.subscribeToPrice(alloc.instrumentId).subscribe({
        next: (update: PriceUpdate) => {
          this.livePrices.set(alloc.instrumentId, {
            ticker: update.ticker,
            price: update.price,
            stale: update.stale,
            updatedAt: new Date()
          });
        }
      });
      this.subscriptions.push(sub);
    });
  }

  private checkStaleness(): void {
    const now = Date.now();
    let anyStale = false;
    this.livePrices.forEach(lp => {
      if (lp.stale || (now - lp.updatedAt.getTime()) > 120_000) {
        anyStale = true;
      }
    });
    this.isStale = anyStale;
  }

  private renderChart(): void {
    if (!this.donutCanvas || !this.recommendation) return;
    this.chart?.destroy();
    const labels = this.recommendation.allocations.map(a => a.instrumentId);
    const data = this.recommendation.allocations.map(a => a.weightPercent);
    this.chart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: this.generateColors(data.length) }]
      },
      options: { responsive: false }
    });
  }

  private generateColors(count: number): string[] {
    const palette = ['#1976d2','#388e3c','#f57c00','#7b1fa2','#c62828','#00838f','#558b2f','#ad1457'];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  }
}
