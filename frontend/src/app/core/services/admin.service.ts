import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, AuditLog, BlacklistedToken, UserRole } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = inject(ApiService);

  // Users Management
  public getUsers(params?: { role?: string; isActive?: boolean | string; search?: string; page?: number; limit?: number }): Observable<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: User[] }> {
    return this.api.get<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: User[] }>('/admin/users', params);
  }

  public createUser(user: { name: string; email?: string; username?: string; password: string; role: UserRole; isActive?: boolean; isMasterAdmin?: boolean }): Observable<{ success: boolean; message: string; data: User }> {
    return this.api.post<{ success: boolean; message: string; data: User }>('/admin/users', user);
  }

  public getUserById(id: string): Observable<{ success: boolean; data: User }> {
    return this.api.get<{ success: boolean; data: User }>(`/admin/users/${id}`);
  }

  public updateUserRole(id: string, role: UserRole): Observable<{ success: boolean; message: string; data: User }> {
    return this.api.patch<{ success: boolean; message: string; data: User }>(`/admin/users/${id}/role`, { role });
  }

  public updateUserStatus(id: string, isActive: boolean): Observable<{ success: boolean; message: string; data: User }> {
    return this.api.patch<{ success: boolean; message: string; data: User }>(`/admin/users/${id}/status`, { isActive });
  }

  public deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);
  }

  public resetUserPassword(id: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(`/admin/users/${id}/reset-password`, { newPassword });
  }

  // Audit Logs Querying
  public getAuditLogs(params?: { action?: string; user?: string; userEmail?: string; username?: string; operator?: string; resource?: string; role?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Observable<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: AuditLog[] }> {
    return this.api.get<{ success: boolean; count: number; total: number; page: number; totalPages: number; data: AuditLog[] }>('/admin/audit-logs', params);
  }

  public getAuditLogById(id: string): Observable<{ success: boolean; data: AuditLog }> {
    return this.api.get<{ success: boolean; data: AuditLog }>(`/admin/audit-logs/${id}`);
  }

  // Blacklist Management
  public getBlacklistedTokens(params?: { activeOnly?: boolean; search?: string; page?: number; limit?: number }): Observable<{
    success: boolean;
    count: number;
    pagination: { total: number; totalPages: number; page: number; limit: number };
    data: BlacklistedToken[];
    total?: number;
    page?: number;
    totalPages?: number;
  }> {
    return this.api.get<{
      success: boolean;
      count: number;
      pagination: { total: number; totalPages: number; page: number; limit: number };
      data: BlacklistedToken[];
      total?: number;
      page?: number;
      totalPages?: number;
    }>('/admin/blacklist', params);
  }

  public blacklistToken(data: { token: string; reason?: string; expiresAt?: string }): Observable<{ success: boolean; message: string; data: BlacklistedToken }> {
    return this.api.post<{ success: boolean; message: string; data: BlacklistedToken }>('/admin/blacklist', data);
  }

  public removeFromBlacklist(token: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/admin/blacklist/${encodeURIComponent(token)}`);
  }
}
