import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserRole, AuthResponse } from '../models';

const TOKEN_KEY = 'il_veliero_token';
const USER_KEY = 'il_veliero_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(this.getStoredUser());
  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticated = computed(() => !!this.currentUserSignal());
  public userRole = computed(() => this.currentUserSignal()?.role || null);
  public isGestore = computed(() => {
    const role = this.currentUserSignal()?.role;
    return role === 'gestore' || role === 'admin';
  });
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  public isMasterAdmin = computed(() => Boolean(this.currentUserSignal()?.isMasterAdmin));
  public displayName = computed(() => this.currentUserSignal()?.name || this.currentUserSignal()?.username || this.currentUserSignal()?.email || 'Utente');

  constructor() {
    // Validate session on bootstrap if token exists
    // Deferred: the JWT interceptor injects AuthService, so an HTTP call made while this
    // constructor is still running fails with a circular-dependency error and wiped the session.
    // Only a real 401 (expired/revoked token) should log the user out, not a network hiccup.
    if (this.getToken()) {
      setTimeout(() => {
        this.fetchCurrentUser().subscribe({
          error: (err) => {
            if (err?.status === 401) this.clearSession(false);
          },
        });
      });
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }

  public login(credentials: { identifier?: string; email?: string; username?: string; password: string } | { email: string; password: string }): Observable<AuthResponse> {
    const payload: { identifier: string; password: string; email?: string; username?: string } = {
      identifier: '',
      password: credentials.password,
    };

    if ('identifier' in credentials && credentials.identifier) {
      payload.identifier = credentials.identifier;
    } else if ('email' in credentials && credentials.email) {
      payload.identifier = credentials.email;
      payload.email = credentials.email;
    } else if ('username' in credentials && credentials.username) {
      payload.identifier = credentials.username;
      payload.username = credentials.username;
    }

    return this.api.post<AuthResponse>('/auth/login', payload).pipe(
      tap((res) => {
        if (res.success && res.token && res.user) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSignal.set(res.user);
        }
      })
    );
  }

  public register(data: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap((res) => {
        if (res.success && res.token && res.user) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSignal.set(res.user);
        }
      })
    );
  }

  public fetchCurrentUser(): Observable<{ success: boolean; user: User }> {
    return this.api.get<{ success: boolean; user: User }>('/auth/me').pipe(
      tap((res) => {
        if (res.success && res.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUserSignal.set(res.user);
        }
      })
    );
  }

  public logout(): Observable<any> {
    return this.api.post('/auth/logout', {}).pipe(
      tap(() => this.clearSession(true)),
      catchError(() => {
        this.clearSession(true);
        return of(null);
      })
    );
  }

  public logoutAll(): Observable<any> {
    return this.api.post('/auth/logout-all', {}).pipe(
      tap(() => this.clearSession(true)),
      catchError(() => {
        this.clearSession(true);
        return of(null);
      })
    );
  }

  public emergencyRecovery(recoveryKey: string, targetIdentifier: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>('/auth/emergency-recovery', {
      recoveryKey,
      targetIdentifier,
      newPassword,
    });
  }

  public changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string; token?: string }> {
    return this.api.post<{ success: boolean; message: string; token?: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    }).pipe(
      tap((res) => {
        if (res.success && res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
      })
    );
  }

  public clearSession(forceRedirect?: boolean): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);

    const currentUrl = this.router.url || '';
    const isProtectedRoute = currentUrl.startsWith('/admin') || currentUrl.startsWith('/gestore');

    if (forceRedirect === true || (forceRedirect !== false && isProtectedRoute)) {
      this.router.navigate(['/login']);
    }
  }

  public hasRole(role: UserRole): boolean {
    const current = this.currentUserSignal();
    if (!current) return false;
    if (role === 'client') return true;
    if (role === 'gestore') return current.role === 'gestore' || current.role === 'admin';
    if (role === 'admin') return current.role === 'admin';
    return false;
  }
}
