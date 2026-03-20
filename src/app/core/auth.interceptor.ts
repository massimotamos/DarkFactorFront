import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../shared/toast.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const jwtService = inject(JwtService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Skip auth endpoints
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = jwtService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const refreshToken = jwtService.getRefreshToken();
        if (refreshToken) {
          return authService.refresh(refreshToken).pipe(
            switchMap(tokens => {
              jwtService.storeTokens(tokens.accessToken, tokens.refreshToken);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.accessToken}` }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              jwtService.clearTokens();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        } else {
          jwtService.clearTokens();
          router.navigate(['/login']);
        }
      }
      if (error.status >= 500) {
        const correlationId = (error.error as any)?.correlationId ?? 'unknown';
        toastService.show(`Server error (ref: ${correlationId})`, 'error');
      }
      return throwError(() => error);
    })
  );
};
