import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // 1. Basic Auth check
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }

  // 2. Role check (if specified in route data)
  const requiredRole = route.data['role'];
  if (requiredRole) {
    const user = auth.currentUser();
    if (user?.role !== requiredRole && user?.role !== 'SUPER_ADMIN') {
      // If user is not the required role AND not a super admin, deny access
      return router.createUrlTree(['/matches']);
    }
  }

  return true;
};
