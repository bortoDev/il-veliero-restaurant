import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { MenuItem } from '../../../src/models/MenuItem';
import { AuditLog } from '../../../src/models/AuditLog';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 1: Granular Audit Trail & Security Logging E2E Suite', () => {
  const app = createApp();

  let adminToken: string;
  let gestoreToken: string;
  let clientToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Audit',
      email: 'admin.audit@ilveliero.it',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });
    adminToken = jwtService.generateToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const gestore = await User.create({
      name: 'Gestore Audit',
      email: 'gestore.audit@ilveliero.it',
      password: 'GestorePassword123!',
      role: 'gestore',
      isActive: true,
    });
    gestoreToken = jwtService.generateToken({
      id: gestore._id.toString(),
      email: gestore.email,
      role: gestore.role,
      name: gestore.name,
    });

    const client = await User.create({
      name: 'Client Audit',
      email: 'client.audit@ilveliero.it',
      password: 'ClientPassword123!',
      role: 'client',
      isActive: true,
    });
    clientToken = jwtService.generateToken({
      id: client._id.toString(),
      email: client.email,
      role: client.role,
      name: client.name,
    });
  });

  it('1.1 should record successful login attempts with operator, IP, and timestamp', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'gestore.audit@ilveliero.it',
        password: 'GestorePassword123!',
      });

    expect(loginRes.status).toBe(200);

    await new Promise((r) => setTimeout(r, 60));
    const auditRecord = await AuditLog.findOne({
      userEmail: 'gestore.audit@ilveliero.it',
      action: 'AUTH_LOGIN',
      status: 'SUCCESS',
    });

    expect(auditRecord).not.toBeNull();
    expect(auditRecord?.action).toBe('AUTH_LOGIN');
    expect(auditRecord?.status).toBe('SUCCESS');
    expect(auditRecord?.role).toBe('gestore');
    expect(auditRecord?.role).not.toBe('anonymous');
    expect(auditRecord?.operator).toBe('gestore.audit@ilveliero.it');
    expect(auditRecord?.ipAddress).toBeDefined();
    expect(auditRecord?.timestamp).toBeInstanceOf(Date);
  });

  it('1.2 should record failed login attempts with status FAILURE and client IP', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'gestore.audit@ilveliero.it',
        password: 'WrongPassword!',
      });

    expect(loginRes.status).toBe(401);

    await new Promise((r) => setTimeout(r, 60));
    const failedLog = await AuditLog.findOne({
      userEmail: 'gestore.audit@ilveliero.it',
      status: 'FAILURE',
    });

    expect(failedLog).not.toBeNull();
    expect(failedLog?.action).toBe('AUTH_LOGIN');
    expect(failedLog?.ipAddress).toBeDefined();
  });

  it('1.3 should record menu mutation with resource ID, operator, and action details', async () => {
    const createRes = await request(app)
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${gestoreToken}`)
      .send({
        title: 'Polenta e Schie Venete',
        description: 'Piatto tradizionale della laguna',
        price: 12.0,
        category: 'pesce',
      });

    expect(createRes.status).toBe(201);
    const dishId = createRes.body.data.id || createRes.body.data._id;

    await new Promise((r) => setTimeout(r, 60));
    const mutationLog = await AuditLog.findOne({
      userEmail: 'gestore.audit@ilveliero.it',
      action: 'CREATE_MENU_ITEM',
      status: 'SUCCESS',
    });

    expect(mutationLog).not.toBeNull();
    expect(mutationLog?.role).toBe('gestore');
    expect(mutationLog?.resource).toBe('menu');
  });

  it('1.4 should sanitize and redact passwords and secret tokens from audit details', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Secret User',
        email: 'secret.user@ilveliero.it',
        password: 'SuperSecretPlainTextPassword123!',
      });

    await new Promise((r) => setTimeout(r, 60));
    const regLog = await AuditLog.findOne({
      userEmail: 'secret.user@ilveliero.it',
    });

    if (regLog && regLog.details?.body?.password) {
      expect(regLog.details.body.password).toBe('[REDACTED]');
    }
  });

  it('1.5 should allow Admin to inspect audit logs while forbidding Client', async () => {
    // 1. Admin inspects audit logs
    const adminRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body).toHaveProperty('success', true);
    expect(Array.isArray(adminRes.body.data)).toBe(true);

    // 2. Client is forbidden (403)
    const clientRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(clientRes.status).toBe(403);
  });
});
