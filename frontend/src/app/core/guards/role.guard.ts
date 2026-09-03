import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (_route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUser();
    if (!currentUser) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    // Role not authorized -> redirect to appropriate home/dashboard
    if (currentUser.role === 'admin') {
      return router.createUrlTree(['/admin/dashboard']);
    } else if (currentUser.role === 'gestore') {
      return router.createUrlTree(['/gestore/dashboard']);
    } else {
      return router.createUrlTree(['/']);
    }
  };
};

export const gestoreGuard = roleGuard(['gestore', 'admin']);
export const adminGuard = roleGuard(['admin']);
