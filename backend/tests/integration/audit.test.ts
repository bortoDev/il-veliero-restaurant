import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { AuditLog } from '../../src/models/AuditLog';
import { jwtService } from '../../src/services/jwt.service';

describe('Audit Logging & Query Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let adminUser: any;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Admin Auditor',
      email: 'admin.auditor@ilveliero.it',
      password: 'SecurePassword123!',
      role: 'admin',
      isActive: true,
    });

    adminToken = jwtService.generateToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
      name: adminUser.name,
    });
  });

  describe('Automatic Mutation Interception and Credential Redaction', () => {
    it('should automatically intercept user creation and redact sensitive password field', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Nuovo Cameriere',
          email: 'cameriere@ilveliero.it',
          password: 'SecretClearTextPassword123!',
          role: 'gestore',
        });

      expect(response.status).toBe(201);

      // Allow asynchronous res.on('finish') to persist audit log
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logs = await AuditLog.find({ action: 'CREATE_USER' });
      expect(logs.length).toBeGreaterThanOrEqual(1);

      const latestLog = logs[logs.length - 1];
      expect(latestLog.status).toBe('SUCCESS');
      expect(latestLog.role).toBe('admin');
      expect(latestLog.userEmail).toBe('admin.auditor@ilveliero.it');
      expect(latestLog.resource).toBe('users');

      // Verify password was strictly redacted
      expect(latestLog.details?.body?.password).toBe('[REDACTED]');
      expect(JSON.stringify(latestLog.details)).not.toContain('SecretClearTextPassword123!');
    });

    it('should log failed login attempts with status FAILURE and redacted password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin.auditor@ilveliero.it',
          password: 'WrongPasswordGuess!',
        });

      expect(response.status).toBe(401);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const failureLog = await AuditLog.findOne({
        userEmail: 'admin.auditor@ilveliero.it',
        status: 'FAILURE',
      });

      expect(failureLog).not.toBeNull();
      expect(failureLog?.status).toBe('FAILURE');
      expect(failureLog?.details?.body?.password).toBe('[REDACTED]');
      expect(failureLog?.details?.statusCode).toBe(401);
    });

    it('should log successful login attempts with status SUCCESS and correct role', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin.auditor@ilveliero.it',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(200);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const successLog = await AuditLog.findOne({
        userEmail: 'admin.auditor@ilveliero.it',
        status: 'SUCCESS',
        action: 'AUTH_LOGIN',
      });

      expect(successLog).not.toBeNull();
      expect(successLog?.status).toBe('SUCCESS');
      expect(successLog?.action).toBe('AUTH_LOGIN');
      expect(successLog?.role).toBe('admin');
      expect(successLog?.role).not.toBe('anonymous');
      expect(successLog?.operator).toBe('admin.auditor@ilveliero.it');
    });
  });

  describe('GET /api/v1/admin/audit-logs Query & Filtering', () => {
    beforeEach(async () => {
      await AuditLog.create([
        {
          action: 'CREATE_USER',
          resource: 'users',
          role: 'admin',
          userEmail: 'admin1@ilveliero.it',
          status: 'SUCCESS',
          ipAddress: '127.0.0.1',
          userAgent: 'JestTest',
          timestamp: new Date('2026-08-10T10:00:00.000Z'),
        },
        {
          action: 'AUTH_LOGIN',
          resource: 'auth',
          role: 'client',
          userEmail: 'client1@ilveliero.it',
          status: 'FAILURE',
          ipAddress: '192.168.1.50',
          userAgent: 'Mozilla',
          timestamp: new Date('2026-08-15T12:00:00.000Z'),
        },
        {
          action: 'UPDATE_USER_ROLE',
          resource: 'users',
          role: 'admin',
          userEmail: 'admin1@ilveliero.it',
          status: 'SUCCESS',
          ipAddress: '127.0.0.1',
          userAgent: 'JestTest',
          timestamp: new Date('2026-08-20T15:00:00.000Z'),
        },
      ]);
    });

    it('should list all audit logs with pagination metadata', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?limit=2&page=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(2);
      expect(response.body.total).toBeGreaterThanOrEqual(3);
      expect(response.body.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should filter audit logs by action regex', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?action=AUTH_LOGIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((log: any) => log.action.includes('AUTH_LOGIN'))).toBe(true);
    });

    it('should filter audit logs by status (FAILURE)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?status=FAILURE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((log: any) => log.status === 'FAILURE')).toBe(true);
    });

    it('should filter audit logs by date range (startDate & endDate)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?startDate=2026-08-12&endDate=2026-08-18')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].action).toBe('AUTH_LOGIN');
    });

    it('should fetch single audit log entry by ID', async () => {
      const existing = await AuditLog.findOne({ action: 'CREATE_USER' });
      const id = existing?._id.toString();

      const response = await request(app)
        .get(`/api/v1/admin/audit-logs/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.action).toBe('CREATE_USER');
    });

    it('should filter audit logs by operator or username', async () => {
      await AuditLog.create({
        action: 'UPDATE_INFO_LOCALE',
        resource: 'info-locale',
        role: 'gestore',
        username: 'gestore_sala',
        operator: 'gestore_sala',
        status: 'SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'JestTest',
        timestamp: new Date(),
      });

      const response = await request(app)
        .get('/api/v1/admin/audit-logs?operator=gestore_sala')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].operator).toBe('gestore_sala');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs/invalid_id_format')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should return 404 for non-existent audit log ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/admin/audit-logs/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
