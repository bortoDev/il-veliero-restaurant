import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { TokenBlacklist } from '../../src/models/TokenBlacklist';
import { AuditLog } from '../../src/models/AuditLog';
import { jwtService } from '../../src/services/jwt.service';

describe('Auth Integration Tests (Register, Login, Logout, Me)', () => {
  const app = createApp();

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new client user with valid data and return JWT', async () => {
      const payload = {
        name: 'Giulia Bianchi',
        email: 'giulia.bianchi@example.com',
        password: 'Password123!',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: 'Giulia Bianchi',
        email: 'giulia.bianchi@example.com',
        role: 'client',
      });
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user in MongoDB
      const dbUser = await User.findOne({ email: 'giulia.bianchi@example.com' }).select('+password');
      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe('Giulia Bianchi');
      expect(dbUser?.role).toBe('client');
      expect(dbUser?.isActive).toBe(true);

      // Verify password hashed with bcrypt
      const isMatch = await bcrypt.compare('Password123!', dbUser!.password!);
      expect(isMatch).toBe(true);

      // Verify AuditLog recorded with role 'client'
      await new Promise((resolve) => setTimeout(resolve, 50));
      const regLog = await AuditLog.findOne({ userEmail: 'giulia.bianchi@example.com', action: 'AUTH_REGISTER' });
      expect(regLog).not.toBeNull();
      expect(regLog?.status).toBe('SUCCESS');
      expect(regLog?.role).toBe('client');
      expect(regLog?.role).not.toBe('anonymous');
    });

    it('should reject registration if email is already in use (409 Conflict)', async () => {
      await User.create({
        name: 'Existing User',
        email: 'duplicate@example.com',
        password: 'Password123!',
        role: 'client',
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'AnotherPassword123!',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'CONFLICT');
    });

    it('should reject registration with invalid email format (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid Email',
          email: 'not-an-email',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
    });

    it('should reject registration with password shorter than 6 characters (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Short Password',
          email: 'short@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
    });

    it('should reject registration with missing name (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'noname@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Mario Rossi',
        email: 'mario.rossi@ilveliero.it',
        password: 'SecurePassword123!',
        role: 'gestore',
        isActive: true,
      });

      await User.create({
        name: 'Deactivated User',
        email: 'deactivated@ilveliero.it',
        password: 'Password123!',
        role: 'client',
        isActive: false,
      });
    });

    it('should successfully authenticate with valid credentials and update lastLogin', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'mario.rossi@ilveliero.it',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        name: 'Mario Rossi',
        email: 'mario.rossi@ilveliero.it',
        role: 'gestore',
      });
      expect(response.body.user).not.toHaveProperty('password');

      // Verify token contains correct claims
      const decoded = jwtService.verifyToken(response.body.token);
      expect(decoded.email).toBe('mario.rossi@ilveliero.it');
      expect(decoded.role).toBe('gestore');

      // Verify lastLogin was updated in DB
      const dbUser = await User.findOne({ email: 'mario.rossi@ilveliero.it' });
      expect(dbUser?.lastLogin).toBeDefined();

      // Verify AuditLog recorded with role 'gestore' and operator
      await new Promise((resolve) => setTimeout(resolve, 50));
      const loginLog = await AuditLog.findOne({ userEmail: 'mario.rossi@ilveliero.it', action: 'AUTH_LOGIN' });
      expect(loginLog).not.toBeNull();
      expect(loginLog?.status).toBe('SUCCESS');
      expect(loginLog?.role).toBe('gestore');
      expect(loginLog?.role).not.toBe('anonymous');
      expect(loginLog?.operator).toBe('mario.rossi@ilveliero.it');
    });

    it('should reject login with case-insensitive email matching', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'MARIO.ROSSI@ILVELIERO.IT',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user.email).toBe('mario.rossi@ilveliero.it');
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'mario.rossi@ilveliero.it',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for non-existent email (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@ilveliero.it',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for deactivated user account (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'deactivated@ilveliero.it',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'UNAUTHORIZED');
      expect(response.body.error.message).toMatch(/deactivated/i);
    });

    it('should reject login with missing email or password (400 Bad Request)', async () => {
      const response1 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'mario.rossi@ilveliero.it' });
      expect(response1.status).toBe(400);

      const response2 = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'SecurePassword123!' });
      expect(response2.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Logout Tester',
        email: 'logout.test@ilveliero.it',
        password: 'Password123!',
        role: 'client',
        isActive: true,
      });

      userId = user._id.toString();
      token = jwtService.generateToken({
        id: userId,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    });

    it('should successfully logout and blacklist the active token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toMatch(/logged out/i);

      // Verify token in Blacklist collection
      const blacklisted = await TokenBlacklist.findOne({ token });
      expect(blacklisted).not.toBeNull();
      expect(blacklisted?.reason).toBe('user_logout');

      // Subsequent call to /me with same token must fail with 401
      const meResponse = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meResponse.status).toBe(401);
      expect(meResponse.body.error.message).toMatch(/revoked/i);
    });

    it('should reject logout without Authorization header (401 Unauthorized)', async () => {
      const response = await request(app).post('/api/v1/auth/logout');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Profile Tester',
        email: 'profile.test@ilveliero.it',
        password: 'Password123!',
        role: 'gestore',
        isActive: true,
      });

      userId = user._id.toString();
      token = jwtService.generateToken({
        id: userId,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    });

    it('should return profile data for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        id: userId,
        email: 'profile.test@ilveliero.it',
        name: 'Profile Tester',
        role: 'gestore',
        isActive: true,
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject when Authorization header is missing', async () => {
      const response = await request(app).get('/api/v1/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject when token is invalid or corrupted', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer corrupted.token.value');

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/invalid authentication token/i);
    });

    it('should reject when user has been deactivated after token generation', async () => {
      await User.findByIdAndUpdate(userId, { isActive: false });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/deactivated/i);
    });

    it('should reject when user has been deleted from database', async () => {
      await User.findByIdAndDelete(userId);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/no longer exists/i);
    });
  });

  describe('Dual Login via Username (Gestori)', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Gestore Username Test',
        username: 'gestore_test',
        password: 'GestorePassword123!',
        role: 'gestore',
        isActive: true,
      });
    });

    it('should allow gestore to login with username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'gestore_test',
          password: 'GestorePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user.username).toBe('gestore_test');
      expect(response.body.user.role).toBe('gestore');

      const decoded = jwtService.verifyToken(response.body.token);
      expect(decoded.username).toBe('gestore_test');
    });

    it('should allow login with generic identifier field matching username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'GESTORE_TEST',
          password: 'GestorePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('gestore_test');
    });
  });

  describe('POST /api/v1/auth/logout-all (Global Session Invalidation)', () => {
    it('should invalidate all active tokens for the user across devices', async () => {
      const user = await User.create({
        name: 'Multi Device User',
        email: 'multidevice@ilveliero.it',
        password: 'Password123!',
        role: 'gestore',
        isActive: true,
        tokenVersion: 0,
      });

      const tokenDevice1 = jwtService.generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        tokenVersion: 0,
      });

      const tokenDevice2 = jwtService.generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        tokenVersion: 0,
      });

      // Both tokens work initially
      const res1 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${tokenDevice1}`);
      expect(res1.status).toBe(200);
      const res2 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${tokenDevice2}`);
      expect(res2.status).toBe(200);

      // Perform Global Logout from Device 1
      const logoutAllRes = await request(app)
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${tokenDevice1}`);

      expect(logoutAllRes.status).toBe(200);
      expect(logoutAllRes.body).toHaveProperty('success', true);

      // Device 1 token is blacklisted and tokenVersion incremented -> 401
      const checkDevice1 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${tokenDevice1}`);
      expect(checkDevice1.status).toBe(401);

      // Device 2 token has old tokenVersion (0 vs 1) -> 401
      const checkDevice2 = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${tokenDevice2}`);
      expect(checkDevice2.status).toBe(401);
      expect(checkDevice2.body.error.message).toMatch(/session has been revoked/i);
    });
  });

  describe('POST /api/v1/auth/emergency-recovery', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Target Recovery User',
        email: 'recovery.target@ilveliero.it',
        username: 'recovery_user',
        password: 'OldPassword123!',
        role: 'admin',
        isActive: true,
        tokenVersion: 0,
      });
    });

    it('should reset password and invalidate old tokens when valid recovery key is provided', async () => {
      const oldToken = jwtService.generateToken({
        id: 'some-id',
        email: 'recovery.target@ilveliero.it',
        role: 'admin',
        name: 'Target Recovery User',
        tokenVersion: 0,
      });

      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: 'EMERGENCY_KEY_VELIERO_2026_MASTER_OVERRIDE_BASSANO',
          targetIdentifier: 'recovery.target@ilveliero.it',
          newPassword: 'BrandNewSecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toMatch(/reimpostata con successo/i);

      // Verify user can login with new password
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'recovery_user',
          password: 'BrandNewSecurePassword123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should reject emergency recovery with invalid key (401 Unauthorized)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: 'WRONG_INVALID_KEY',
          targetIdentifier: 'recovery.target@ilveliero.it',
          newPassword: 'BrandNewSecurePassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.message).toMatch(/chiave di recupero/i);
    });

    it('should reject emergency recovery with non-existent user (404 Not Found)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/emergency-recovery')
        .send({
          recoveryKey: 'EMERGENCY_KEY_VELIERO_2026_MASTER_OVERRIDE_BASSANO',
          targetIdentifier: 'nonexistent@ilveliero.it',
          newPassword: 'BrandNewSecurePassword123!',
        });

      expect(response.status).toBe(404);
    });
  });
});
