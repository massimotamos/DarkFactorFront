import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from './jwt.service';

export const authGuard: CanActivateFn = () => {
  const jwtService = inject(JwtService);
  const router = inject(Router);

  const token = jwtService.getAccessToken();
  if (token && !jwtService.isExpired(token)) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
