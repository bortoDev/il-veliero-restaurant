import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../models';

describe('AuthService (Milestone 4 - Security & Dual Auth)', () => {
  let service: AuthService;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'patch', 'delete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    // Default stub for bootstrap fetchCurrentUser
    apiSpy.get.and.returnValue(of({ success: true, user: null as any }));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with null user and false authentication signals', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.isAdmin()).toBeFalse();
    expect(service.isGestore()).toBeFalse();
    expect(service.isMasterAdmin()).toBeFalse();
    expect(service.displayName()).toBe('Utente');
  });

  it('should correctly format dual login payload when using identifier', (done) => {
    const mockUser: User = {
      id: 'usr_1',
      name: 'Federico Bortolato',
      email: 'bortolatofilippo05@gmail.com',
      role: 'admin',
      isMasterAdmin: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: 'jwt_mock_token_123',
      user: mockUser,
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.login({ identifier: 'bortolatofilippo05@gmail.com', password: 'AdminPass123!' }).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(apiSpy.post).toHaveBeenCalledWith('/auth/login', {
        identifier: 'bortolatofilippo05@gmail.com',
        password: 'AdminPass123!',
      });
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.isAdmin()).toBeTrue();
      expect(service.isMasterAdmin()).toBeTrue();
      expect(service.displayName()).toBe('Federico Bortolato');
      expect(localStorage.getItem('il_veliero_token')).toBe('jwt_mock_token_123');
      done();
    });
  });

  it('should correctly format login payload when using username for gestore', (done) => {
    const mockUser: User = {
      id: 'usr_2',
      name: 'Gestore Sala',
      username: 'gestore_veliero',
      role: 'gestore',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const mockResponse: AuthResponse = {
      success: true,
      token: 'jwt_mock_token_gestore',
      user: mockUser,
    };

    apiSpy.post.and.returnValue(of(mockResponse));

    service.login({ identifier: 'gestore_veliero', password: 'GestorePass123!' }).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(service.isGestore()).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isMasterAdmin()).toBeFalse();
      expect(service.displayName()).toBe('Gestore Sala');
      done();
    });
  });

  it('should call POST /auth/logout-all and clear session on logoutAll', (done) => {
    apiSpy.post.and.returnValue(of({ success: true, message: 'All sessions revoked' }));

    service.logoutAll().subscribe(() => {
      expect(apiSpy.post).toHaveBeenCalledWith('/auth/logout-all', {});
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('should call POST /auth/emergency-recovery with recovery credentials', (done) => {
    const recoveryRes = { success: true, message: 'Password reimpostata con successo d\'emergenza' };
    apiSpy.post.and.returnValue(of(recoveryRes));

    service.emergencyRecovery('REC_KEY_TEST', 'gestore_veliero', 'NewSecurePass123!').subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(apiSpy.post).toHaveBeenCalledWith('/auth/emergency-recovery', {
        recoveryKey: 'REC_KEY_TEST',
        targetIdentifier: 'gestore_veliero',
        newPassword: 'NewSecurePass123!',
      });
      done();
    });
  });
});
