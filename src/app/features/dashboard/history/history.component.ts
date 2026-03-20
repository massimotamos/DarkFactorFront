import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioService, PortfolioRecommendation } from '../portfolio.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="history-container">
      <header>
        <h2>Recommendation History</h2>
        <a routerLink="/dashboard">← Back to Dashboard</a>
      </header>

      <div *ngIf="history.length === 0" class="empty">No history yet.</div>

      <div class="list" *ngIf="history.length > 0">
        <div class="list-item"
             *ngFor="let rec of history"
             [class.selected]="selected?.id === rec.id"
             (click)="select(rec)">
          <span>{{ rec.generatedAt | date:'medium' }}</span>
          <span>Return: {{ rec.expectedReturnPercent }}%</span>
          <span>Vol: {{ rec.volatilityPercent }}%</span>
        </div>
      </div>

      <div class="detail" *ngIf="selected">
        <h3>Details — {{ selected.generatedAt | date:'medium' }}</h3>
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Weight %</th>
              <th>Price at Generation</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let alloc of selected.allocations">
              <td>{{ alloc.instrumentId }}</td>
              <td>{{ alloc.weightPercent | number:'1.2-2' }}%</td>
              <td>{{ alloc.priceAtGeneration | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="selected.dataWarning" class="warn">{{ selected.dataWarning }}</p>
      </div>
    </div>
  `,
  styles: [`
    .history-container { padding: 1.5rem; }
    header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .list { display: flex; flex-direction: column; gap: 0.5rem; max-width: 600px; }
    .list-item { display: flex; gap: 1rem; padding: 0.75rem; border: 1px solid #eee; border-radius: 4px; cursor: pointer; }
    .list-item:hover, .list-item.selected { background: #e3f2fd; }
    .detail { margin-top: 2rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
    .warn { color: #f57c00; }
    .empty { color: #666; }
  `]
})
export class HistoryComponent implements OnInit {

  history: PortfolioRecommendation[] = [];
  selected: PortfolioRecommendation | null = null;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.portfolioService.getHistory().subscribe({
      next: (h) => {
        this.history = h;
        if (h.length > 0) this.selected = h[0];
      }
    });
  }

  select(rec: PortfolioRecommendation): void {
    this.portfolioService.getHistoryById(rec.id).subscribe({
      next: (detail) => { this.selected = detail; }
    });
  }
}
