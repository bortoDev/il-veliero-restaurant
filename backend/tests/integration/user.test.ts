import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { jwtService } from '../../src/services/jwt.service';

describe('Admin User Governance Integration Tests', () => {
  const app = createApp();

  let adminToken: string;
  let adminId: string;
  let gestoreId: string;
  let clientId: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Chief',
      email: 'chief.admin@ilveliero.it',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });
    adminId = admin._id.toString();
    adminToken = jwtService.generateToken({
      id: adminId,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const gestore = await User.create({
      name: 'Marco Gestore',
      email: 'marco.gestore@ilveliero.it',
      password: 'GestorePassword123!',
      role: 'gestore',
      isActive: true,
    });
    gestoreId = gestore._id.toString();

    const client = await User.create({
      name: 'Cliente Fedele',
      email: 'cliente.fedele@ilveliero.it',
      password: 'ClientPassword123!',
      role: 'client',
      isActive: true,
    });
    clientId = client._id.toString();
  });

  describe('GET /api/v1/admin/users', () => {
    it('should list all users with pagination and password exclusion', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.count).toBe(3);
      expect(response.body.total).toBe(3);
      expect(response.body.data[0]).not.toHaveProperty('password');
    });

    it('should filter users by role (e.g. gestore)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users?role=gestore')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].email).toBe('marco.gestore@ilveliero.it');
    });

    it('should search users by name or email query', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users?search=Marco')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].name).toBe('Marco Gestore');
    });
  });

  describe('POST /api/v1/admin/users', () => {
    it('should allow admin to create a new user account with specified role', async () => {
      const payload = {
        name: 'Sara Sommelier',
        email: 'sara.sommelier@ilveliero.it',
        password: 'WineMaster123!',
        role: 'gestore',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject({
        name: 'Sara Sommelier',
        email: 'sara.sommelier@ilveliero.it',
        role: 'gestore',
        isActive: true,
      });
      expect(response.body.data).not.toHaveProperty('password');

      const dbUser = await User.findOne({ email: 'sara.sommelier@ilveliero.it' });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.role).toBe('gestore');
    });

    it('should reject creating user with duplicate email (409 Conflict)', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Chief',
          email: 'chief.admin@ilveliero.it',
          password: 'Password123!',
          role: 'admin',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should reject creating user with invalid role', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Super User',
          email: 'superuser@ilveliero.it',
          password: 'Password123!',
          role: 'superuser',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should allow admin to create a gestore with username and password only (no email)', async () => {
      const payload = {
        name: 'Gestore Senza Email',
        username: 'gestore_sala_nuovo',
        password: 'GestorePass123!',
        role: 'gestore',
        isActive: true,
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.username).toBe('gestore_sala_nuovo');
      expect(response.body.data.role).toBe('gestore');

      const dbUser = await User.findOne({ username: 'gestore_sala_nuovo' });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.username).toBe('gestore_sala_nuovo');
    });
  });

  describe('Master Admin Immutability Protection', () => {
    let masterAdminId: string;

    beforeEach(async () => {
      const masterAdmin = await User.create({
        name: 'Federico Bortolato (Master Admin)',
        email: 'info@ristorante-ilveliero.it',
        password: 'AdminPassword123!',
        role: 'admin',
        isMasterAdmin: true,
        isActive: true,
      });
      masterAdminId = masterAdmin._id.toString();
    });

    it('should reject another admin attempting to demote a Master Admin (403 Forbidden)', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'gestore' });

      expect(response.status).toBe(403);
      expect(response.body.error.message).toMatch(/non è consentito modificare o eliminare un master admin/i);
    });

    it('should reject another admin attempting to deactivate a Master Admin (403 Forbidden)', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${masterAdminId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(403);
      expect(response.body.error.message).toMatch(/non è consentito modificare o eliminare un master admin/i);
    });

    it('should reject another admin attempting to delete a Master Admin (403 Forbidden)', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${masterAdminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.message).toMatch(/non è consentito modificare o eliminare un master admin/i);

      // Verify Master Admin still exists
      const check = await User.findById(masterAdminId);
      expect(check).not.toBeNull();
    });
  });

  describe('GET /api/v1/admin/users/:id', () => {
    it('should fetch single user profile by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/users/${gestoreId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(gestoreId);
      expect(response.body.data.email).toBe('marco.gestore@ilveliero.it');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent user ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should promote a gestore to admin', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${gestoreId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('admin');

      const updated = await User.findById(gestoreId);
      expect(updated?.role).toBe('admin');
    });

    it('should prevent admin self-demotion (Self-Lockout Guard)', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'gestore' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/cannot demote your own/i);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/status', () => {
    it('should deactivate a user account and block subsequent logins', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${gestoreId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);

      // Verify login is blocked
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'marco.gestore@ilveliero.it',
          password: 'GestorePassword123!',
        });

      expect(loginRes.status).toBe(401);
      expect(loginRes.body.error.message).toMatch(/deactivated/i);
    });

    it('should reactivate a deactivated user account', async () => {
      await User.findByIdAndUpdate(gestoreId, { isActive: false });

      const response = await request(app)
        .patch(`/api/v1/admin/users/${gestoreId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: true });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should prevent admin self-deactivation (Self-Lockout Guard)', async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/users/${adminId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/cannot deactivate your own/i);
    });
  });

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('should delete a user account', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/deleted successfully/i);

      const check = await User.findById(clientId);
      expect(check).toBeNull();
    });

    it('should prevent admin self-deletion (Self-Deletion Guard)', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toMatch(/cannot delete your own/i);
    });

    it('should return 404 when attempting to delete non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/v1/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
