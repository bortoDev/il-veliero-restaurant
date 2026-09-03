import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized: token expired or blacklisted
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.clearSession();
      }

      const errorMessage =
        error.error?.error?.message ||
        error.error?.message ||
        error.statusText ||
        'Si è verificato un errore di comunicazione.';

      return throwError(() => ({
        status: error.status,
        code: error.error?.error?.code || 'UNKNOWN_ERROR',
        message: errorMessage,
        raw: error,
      }));
    })
  );
};
