import { inject } from '@angular/core';
import { AuthService, Role } from '../services/auth.service';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() || router.createUrlTree(['/login']);
};
