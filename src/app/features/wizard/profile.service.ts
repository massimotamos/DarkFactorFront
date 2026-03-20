import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FinancialProfileRequest {
  riskTolerance: string;
  experience: string;
  incomeBracket: string;
  netWorthBand: string;
  horizonMonths: number;
  regions: string[];
  targetRoiPercent: number;
}

export interface FinancialProfileResponse extends FinancialProfileRequest {
  id: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  constructor(private http: HttpClient) {}

  createProfile(request: FinancialProfileRequest): Observable<FinancialProfileResponse> {
    return this.http.post<FinancialProfileResponse>('/api/profile', request);
  }

  updateProfile(request: FinancialProfileRequest): Observable<FinancialProfileResponse> {
    return this.http.put<FinancialProfileResponse>('/api/profile', request);
  }

  getProfile(): Observable<FinancialProfileResponse> {
    return this.http.get<FinancialProfileResponse>('/api/profile');
  }
}
