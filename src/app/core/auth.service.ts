import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { JwtService } from './jwt.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router
  ) {}

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/login', { email, password }).pipe(
      tap(tokens => {
        this.jwtService.storeTokens(tokens.accessToken, tokens.refreshToken);
        this.scheduleRefresh(tokens.expiresIn);
      })
    );
  }

  register(email: string, password: string): Observable<{ id: string; email: string }> {
    return this.http.post<{ id: string; email: string }>('/api/auth/register', { email, password });
  }

  refresh(refreshToken: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/refresh', { refreshToken }).pipe(
      tap(tokens => {
        this.jwtService.storeTokens(tokens.accessToken, tokens.refreshToken);
        this.scheduleRefresh(tokens.expiresIn);
      })
    );
  }

  logout(): void {
    const refreshToken = this.jwtService.getRefreshToken();
    if (refreshToken) {
      this.http.post('/api/auth/logout', { refreshToken }).subscribe({ error: () => {} });
    }
    this.clearRefreshTimer();
    this.jwtService.clearTokens();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.jwtService.getAccessToken();
    return !!token && !this.jwtService.isExpired(token);
  }

  private scheduleRefresh(expiresInSeconds: number): void {
    this.clearRefreshTimer();
    // Refresh 60 seconds before expiry
    const delayMs = Math.max((expiresInSeconds - 60) * 1000, 0);
    this.refreshTimer = setTimeout(() => {
      const refreshToken = this.jwtService.getRefreshToken();
      if (refreshToken) {
        this.refresh(refreshToken).subscribe({
          error: () => {
            this.jwtService.clearTokens();
            this.router.navigate(['/login']);
          }
        });
      }
    }, delayMs);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearRefreshTimer();
  }
}
