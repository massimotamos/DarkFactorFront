import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AllocationLine {
  instrumentId: string;
  weightPercent: number;
  priceAtGeneration: number;
}

export interface PortfolioRecommendation {
  id: string;
  userId: string;
  generatedAt: string;
  expectedReturnPercent: number;
  volatilityPercent: number;
  allocations: AllocationLine[];
  dataWarning?: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {

  constructor(private http: HttpClient) {}

  generateRecommendation(): Observable<PortfolioRecommendation> {
    return this.http.post<PortfolioRecommendation>('/api/portfolio/recommend', {});
  }

  getHistory(): Observable<PortfolioRecommendation[]> {
    return this.http.get<PortfolioRecommendation[]>('/api/portfolio/history');
  }

  getHistoryById(id: string): Observable<PortfolioRecommendation> {
    return this.http.get<PortfolioRecommendation>(`/api/portfolio/history/${id}`);
  }
}
