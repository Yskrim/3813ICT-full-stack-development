import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, Role } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed = (route.data['roles'] ?? []) as Role[];

  return auth.hasRole(...allowed) || router.createUrlTree(['/channels'])
};
