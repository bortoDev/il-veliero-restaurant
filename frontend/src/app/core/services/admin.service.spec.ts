import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminService } from './admin.service';
import { ApiService } from './api.service';
import { User, AuditLog, BlacklistedToken } from '../models';

describe('AdminService (Milestone 4 - User Governance & Audit)', () => {
  let service: AdminService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'patch', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        AdminService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });

    service = TestBed.inject(AdminService);
  });

  it('should create gestore user with username only', (done) => {
    const newUser = {
      name: 'Gestore Forno',
      username: 'gestore_forno',
      password: 'GestorePass123!',
      role: 'gestore' as const,
      isActive: true,
    };

    const mockResponse = {
      success: true,
      message: 'Gestore creato con successo',
      data: {
        id: 'usr_new_1',
        ...newUser,
        createdAt: new Date().toISOString(),
      } as User,
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.createUser(newUser).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(apiSpy.post).toHaveBeenCalledWith('/admin/users', newUser);
      expect(res.data.username).toBe('gestore_forno');
      done();
    });
  });

  it('should query audit logs with operator and date filters', (done) => {
    const filters = {
      operator: 'gestore_veliero',
      action: 'AUTH_LOGIN',
      startDate: '2026-08-01',
      endDate: '2026-08-30',
      status: 'SUCCESS',
    };

    const mockAuditResponse = {
      success: true,
      count: 1,
      total: 1,
      page: 1,
      totalPages: 1,
      data: [
        {
          id: 'log_1',
          operator: 'gestore_veliero',
          username: 'gestore_veliero',
          role: 'gestore',
          action: 'AUTH_LOGIN',
          resource: 'AUTH',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          details: { method: 'USERNAME_PASSWORD' },
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
        } as AuditLog,
      ],
    };

    apiSpy.get.and.returnValue(of(mockAuditResponse));

    service.getAuditLogs(filters).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(apiSpy.get).toHaveBeenCalledWith('/admin/audit-logs', filters);
      expect(res.data.length).toBe(1);
      expect(res.data[0].operator).toBe('gestore_veliero');
      done();
    });
  });

  it('should query blacklisted tokens with pagination response', (done) => {
    const params = { page: 1, limit: 10 };
    const mockBlacklistResponse = {
      success: true,
      count: 1,
      pagination: {
        total: 1,
        totalPages: 1,
        page: 1,
        limit: 10,
      },
      data: [
        {
          token: 'token_123',
          reason: 'admin_revocation',
          expiresAt: new Date().toISOString(),
          revokedAt: new Date().toISOString(),
        } as BlacklistedToken,
      ],
    };

    apiSpy.get.and.returnValue(of(mockBlacklistResponse));

    service.getBlacklistedTokens(params).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(apiSpy.get).toHaveBeenCalledWith('/admin/blacklist', params);
      expect(res.pagination.total).toBe(1);
      expect(res.data.length).toBe(1);
      expect(res.data[0].token).toBe('token_123');
      done();
    });
  });
});
