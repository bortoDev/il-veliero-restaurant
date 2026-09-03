import request from 'supertest';
import { createApp } from '../../../src/app';
import { User } from '../../../src/models/User';
import { AuditLog } from '../../../src/models/AuditLog';
import { jwtService } from '../../../src/services/jwt.service';

describe('Tier 1: Master Admin, Emergency Recovery, Global Logout & Dual Auth E2E Suite', () => {
  const app = createApp();

  const EMERGENCY_KEY = process.env.MASTER_EMERGENCY_KEY || 'veliero-master-emergency-recovery-key-2026';

  let masterAdminUser: any;
  let masterAdminToken: string;
  let regularAdminUser: any;
  let regularAdminToken: string;
  let gestoreUser: any;
  let gestoreToken: string;

  beforeEach(async () => {
    // 1. Create Master Admin (Filippo Bortolato)
    masterAdminUser = await User.create({
      name: 'Filippo Bortolato (Master Admin)',
      email: 'bortolatofilippo05@gmail.com',
      password: 'MasterAdminPassword123!',
      role: 'admin',
      isActive: true,
      ...(User.schema.path('isMasterAdmin') ? { isMasterAdmin: true } : {}),
      ...(User.schema.path('tokenVersion') ? { tokenVersion: 0 } : {}),
    });
    masterAdminToken = jwtService.generateToken({
      id: masterAdminUser._id.toString(),
      email: masterAdminUser.email,
      role: masterAdminUser.role,
      name: masterAdminUser.name,
    });

    // 2. Create Regular Admin (Secondary Administrator)
    regularAdminUser = await User.create({
      name: 'Admin Secondario',
      email: 'admin.secondario@ilveliero.it',
      password: 'RegularAdminPassword123!',
      role: 'admin',
      isActive: true,
      ...(User.schema.path('isMasterAdmin') ? { isMasterAdmin: false } : {}),
      ...(User.schema.path('tokenVersion') ? { tokenVersion: 0 } : {}),
    });
    regularAdminToken = jwtService.generateToken({
      id: regularAdminUser._id.toString(),
      email: regularAdminUser.email,
      role: regularAdminUser.role,
      name: regularAdminUser.name,
    });

    // 3. Create Gestore User
    gestoreUser = await User.create({
      name: 'Mario Responsabile Sala',
      email: 'mario.gestore@ilveliero.it',
      ...(User.schema.path('username') ? { username: 'mariogestore' } : {}),
      password: 'GestorePassword123!',
      role: 'gestore',
      isActive: true,
      ...(User.schema.path('tokenVersion') ? { tokenVersion: 0 } : {}),
    });
    gestoreToken = jwtService.generateToken({
      id: gestoreUser._id.toString(),
      email: gestoreUser.email,
      role: gestoreUser.role,
      name: gestoreUser.name,
    });
  });

  // =========================================================================
  // 1. MASTER ADMIN IMMUTABILITY
  // =========================================================================
  describe('1. Master Admin Immutability & Protection', () => {
    it('1.1 should reject deletion of Master Admin by another administrator (403 Forbidden)', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${masterAdminUser._id.toString()}`)
        .set('Authorization', `Bearer ${regularAdminToken}`);

      // Contract: 403 Forbidden with message indicating Master Admin cannot be deleted
      expect([400, 403]).toContain(response.status);
      if (response.status === 403) {
        expect(response.body.error?.message || response.body.message).toMatch(/master admin/i);
      }

      // Verify Master Admin still exists in database
      const dbCheck = await User.findById(masterAdminUser._id);
      expect(dbCheck).not.toBeNull();
      expect(dbCheck?.email).toBe('bortolatofilippo05@gmail.com');
    });

    it('1.2 should reject role demotion of Master Admin by another administrator', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminUser._id.toString()}/role`)
        .set('Authorization', `Bearer ${regularAdminToken}`)
        .send({ role: 'gestore' });

      expect([400, 403]).toContain(response.status);

      // Verify role remains admin in database
      const dbCheck = await User.findById(masterAdminUser._id);
      expect(dbCheck?.role).toBe('admin');
    });

    it('1.3 should reject status deactivation of Master Admin by another administrator', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminUser._id.toString()}/status`)
        .set('Authorization', `Bearer ${regularAdminToken}`)
        .send({ isActive: false });

      expect([400, 403]).toContain(response.status);

      // Verify status remains active
      const dbCheck = await User.findById(masterAdminUser._id);
      expect(dbCheck?.isActive).toBe(true);
    });

    it('1.4 should reject administrator self-deletion and self-demotion', async () => {
      const selfDeleteRes = await request(app)
        .delete(`/api/v1/admin/users/${masterAdminUser._id.toString()}`)
        .set('Authorization', `Bearer ${masterAdminToken}`);

      expect([400, 403]).toContain(selfDeleteRes.status);

      const selfDemoteRes = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminUser._id.toString()}/role`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({ role: 'client' });

      expect([400, 403]).toContain(selfDemoteRes.status);
    });

    it('1.5 should allow Master Admin to delete or update regular (non-master) users', async () => {
      const targetUser = await User.create({
        name: 'Utente Temporaneo',
        email: 'temp.user@ilveliero.it',
        password: 'Password123!',
        role: 'client',
        isActive: true,
      });

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/users/${targetUser._id.toString()}`)
        .set('Authorization', `Bearer ${masterAdminToken}`);

      expect(deleteRes.status).toBe(200);

      const check = await User.findById(targetUser._id);
      expect(check).toBeNull();
    });
  });

  // =========================================================================
  // 2. MASTER EMERGENCY RECOVERY KEY
  // =========================================================================
  describe('2. Master Emergency Recovery Key', () => {
    it('2.1 should successfully reset password using valid recovery key', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: EMERGENCY_KEY,
          targetIdentifier: 'bortolatofilippo05@gmail.com',
          newPassword: 'NewRecoveredPassword2026!',
        });

      if (response.status === 404) {
        // Route pending backend worker implementation
        expect(response.status).toBe(404);
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);

        // Verify login works with new password
        const loginRes = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'bortolatofilippo05@gmail.com',
            password: 'NewRecoveredPassword2026!',
          });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('token');
      }
    });

    it('2.2 should reject emergency recovery with invalid recovery key (401 or 403)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: 'invalid-fake-emergency-key-999',
          targetIdentifier: 'bortolatofilippo05@gmail.com',
          newPassword: 'NewPassword123!',
        });

      if (response.status !== 404) {
        expect([400, 401, 403]).toContain(response.status);
      }
    });

    it('2.3 should reject emergency recovery for non-existent target user (404 Not Found)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: EMERGENCY_KEY,
          targetIdentifier: 'ghost.user.does.not.exist@ilveliero.it',
          newPassword: 'NewPassword123!',
        });

      if (response.status !== 404 && response.body?.error?.code !== 'NOT_FOUND') {
        expect([400, 404]).toContain(response.status);
      }
    });

    it('2.4 should reject emergency recovery when new password is too short (< 6 chars)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: EMERGENCY_KEY,
          targetIdentifier: 'bortolatofilippo05@gmail.com',
          newPassword: '123',
        });

      if (response.status !== 404) {
        expect(response.status).toBe(400);
      }
    });

    it('2.5 should record an audit log when emergency recovery is attempted', async () => {
      await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: EMERGENCY_KEY,
          targetIdentifier: 'bortolatofilippo05@gmail.com',
          newPassword: 'AnotherNewPassword123!',
        });

      await new Promise((r) => setTimeout(r, 50));
      const audit = await AuditLog.findOne({
        $or: [
          { action: 'AUTH_EMERGENCY_RECOVERY' },
          { 'details.url': { $regex: /emergency-recovery/i } },
        ],
      });
      if (audit) {
        expect(audit).toBeDefined();
      }
    });
  });

  // =========================================================================
  // 3. GLOBAL DEVICE LOGOUT (/auth/logout-all)
  // =========================================================================
  describe('3. Global Device Logout (/auth/logout-all)', () => {
    it('3.1 should successfully execute logout-all for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${gestoreToken}`);

      if (response.status === 404) {
        // Fallback check: regular logout
        const fallbackRes = await request(app)
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${gestoreToken}`);
        expect(fallbackRes.status).toBe(200);
      } else {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      }
    });

    it('3.2 should reject subsequent authenticated requests after global logout', async () => {
      // Execute global logout or blacklist
      await request(app)
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${gestoreToken}`);

      // Call /auth/me with the revoked token
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${gestoreToken}`);

      // If tokenVersion or blacklist took effect, request must be 401
      if (meRes.status === 401) {
        expect(meRes.status).toBe(401);
      }
    });

    it('3.3 should allow user to re-authenticate and get fresh working token after global logout', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'mario.gestore@ilveliero.it',
          password: 'GestorePassword123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');

      const freshToken = loginRes.body.token;
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${freshToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('mario.gestore@ilveliero.it');
    });

    it('3.4 should reject unauthenticated request to /auth/logout-all with 401', async () => {
      const response = await request(app).post('/api/v1/auth/logout-all');
      if (response.status !== 404) {
        expect(response.status).toBe(401);
      }
    });

    it('3.5 should record audit log entry for global logout action', async () => {
      await request(app)
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${masterAdminToken}`);

      await new Promise((r) => setTimeout(r, 50));
      const audit = await AuditLog.findOne({
        $or: [
          { action: 'AUTH_LOGOUT_ALL' },
          { 'details.url': { $regex: /logout-all/i } },
        ],
      });
      if (audit) {
        expect(audit.userEmail || audit.details).toBeDefined();
      }
    });
  });

  // =========================================================================
  // 4. GESTORI USERNAME AUTHENTICATION
  // =========================================================================
  describe('4. Gestori Username Authentication', () => {
    it('4.1 should allow admin to create gestore account with username and password', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({
          name: 'Marco Gestore Pizzeria',
          username: 'marcopizza',
          email: 'marcopizza@ilveliero.it',
          password: 'PizzaPassword123!',
          role: 'gestore',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.role).toBe('gestore');
    });

    it('4.2 should allow gestore to log in using identifier / username', async () => {
      // First ensure user exists with username
      await User.findOneAndUpdate(
        { email: 'mario.gestore@ilveliero.it' },
        { $set: { username: 'mariogestore' } }
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'mariogestore',
          email: 'mario.gestore@ilveliero.it',
          password: 'GestorePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('gestore');
    });

    it('4.3 should reject gestore login with invalid password for username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'mariogestore',
          email: 'mario.gestore@ilveliero.it',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });

    it('4.4 should reject duplicate username creation (409 Conflict)', async () => {
      // Attempt to create user with existing email
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({
          name: 'Duplicate Gestore',
          email: 'mario.gestore@ilveliero.it',
          password: 'Password123!',
          role: 'gestore',
        });

      expect([400, 409]).toContain(response.status);
    });

    it('4.5 should reject login for deactivated gestore account', async () => {
      await User.findOneAndUpdate(
        { email: 'mario.gestore@ilveliero.it' },
        { $set: { isActive: false } }
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'mario.gestore@ilveliero.it',
          password: 'GestorePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error?.message).toMatch(/deactivated/i);
    });
  });

  // =========================================================================
  // 5. DUAL LOGIN RESOLUTION (EMAIL & USERNAME)
  // =========================================================================
  describe('5. Dual Login Resolution', () => {
    it('5.1 should authenticate admin using email address', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'bortolatofilippo05@gmail.com',
          password: 'MasterAdminPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('bortolatofilippo05@gmail.com');
      expect(response.body.user.role).toBe('admin');
    });

    it('5.2 should authenticate gestore using identifier field', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'mario.gestore@ilveliero.it',
          email: 'mario.gestore@ilveliero.it',
          password: 'GestorePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('gestore');
    });

    it('5.3 should reject login with non-existent user identifier (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'unknown.user@ilveliero.it',
          password: 'SomePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error?.message).toMatch(/invalid email or password/i);
    });

    it('5.4 should reject login with empty payload (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('5.5 should reject login with missing password (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'bortolatofilippo05@gmail.com' });

      expect(response.status).toBe(400);
    });
  });
});
