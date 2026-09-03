import mongoose from 'mongoose';
import {
  User,
  MenuItem,
  Pescato,
  Avviso,
  Evento,
  InfoLocale,
  TokenBlacklist,
  AuditLog,
} from '../../src/models';

describe('Mongoose Models Unit Test Suite', () => {
  describe('User Model', () => {
    it('should hash the password before saving and verify it with comparePassword', async () => {
      const plainPassword = 'SecretPassword123!';
      const user = new User({
        name: 'Mario Rossi',
        email: 'mario.rossi@example.com',
        password: plainPassword,
        role: 'gestore',
      });

      await user.save();

      // Password should be hashed (not equal to plain text)
      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);

      // Verify comparePassword method
      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);

      const isWrong = await user.comparePassword('WrongPassword123!');
      expect(isWrong).toBe(false);
    });

    it('should strip password from JSON output', async () => {
      const user = new User({
        name: 'Giulia Verdi',
        email: 'giulia.verdi@example.com',
        password: 'Password123!',
        role: 'client',
      });
      await user.save();

      const userJson = user.toJSON();
      expect(userJson.password).toBeUndefined();
      expect(userJson.name).toBe('Giulia Verdi');
      expect(userJson.role).toBe('client');
    });

    it('should enforce unique email constraint', async () => {
      const email = 'duplicate@example.com';
      await User.create({
        name: 'User 1',
        email,
        password: 'Password123!',
        role: 'client',
      });

      let duplicateError: any;
      try {
        await User.create({
          name: 'User 2',
          email,
          password: 'Password123!',
          role: 'client',
        });
      } catch (err) {
        duplicateError = err;
      }

      expect(duplicateError).toBeDefined();
    });

    it('should reject invalid role values', async () => {
      const user = new User({
        name: 'Invalid Role User',
        email: 'invalid.role@example.com',
        password: 'Password123!',
        role: 'superadmin' as any,
      });

      let validationError: any;
      try {
        await user.validate();
      } catch (err) {
        validationError = err;
      }

      expect(validationError).toBeDefined();
      expect(validationError.errors.role).toBeDefined();
    });

    it('should allow user creation with username and default tokenVersion and isMasterAdmin', async () => {
      const user = new User({
        name: 'Gestore Senza Email',
        username: 'gestore_sala',
        password: 'Password123!',
        role: 'gestore',
      });
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.username).toBe('gestore_sala');
      expect(user.isMasterAdmin).toBe(false);
      expect(user.tokenVersion).toBe(0);
    });

    it('should create Master Admin user with isMasterAdmin flag', async () => {
      const user = new User({
        name: 'Federico Bortolato',
        email: 'federico@ilveliero.it',
        password: 'AdminPassword123!',
        role: 'admin',
        isMasterAdmin: true,
      });
      await user.save();

      expect(user._id).toBeDefined();
      expect(user.isMasterAdmin).toBe(true);
    });
  });

  describe('MenuItem Model', () => {
    it('should create a valid dish with categories and allergens', async () => {
      const dish = await MenuItem.create({
        title: 'Spaghetti alle Vongole',
        description: 'Vongole veraci dell\'Adriatico con aglio, olio e prezzemolo',
        price: 18.5,
        category: 'pesce',
        subcategory: 'primi',
        allergens: ['glutine', 'molluschi'],
        isAvailable: true,
      });

      expect(dish._id).toBeDefined();
      expect(dish.title).toBe('Spaghetti alle Vongole');
      expect(dish.price).toBe(18.5);
      expect(dish.category).toBe('pesce');
      expect(dish.subcategory).toBe('primi');
      expect(dish.allergens).toContain('glutine');
      expect(dish.allergens).toContain('molluschi');
    });

    it('should reject invalid categories', async () => {
      const dish = new MenuItem({
        title: 'Unknown Dish',
        description: 'Testing invalid category',
        price: 10,
        category: 'dessert_invalido' as any,
      });

      let error: any;
      try {
        await dish.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.category).toBeDefined();
    });

    it('should reject negative price', async () => {
      const dish = new MenuItem({
        title: 'Free Dish',
        description: 'Negative price test',
        price: -5,
        category: 'pesce',
      });

      let error: any;
      try {
        await dish.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });
  });

  describe('Pescato Model', () => {
    it('should create a fresh catch entry with default values', async () => {
      const catchItem = await Pescato.create({
        title: 'Orata Selvaggia dell\'Adriatico',
        description: 'Pescata all\'amo all\'alba',
        price: 35.0,
        kilogramsAvailable: 4.5,
      });

      expect(catchItem._id).toBeDefined();
      expect(catchItem.isAvailable).toBe(true);
      expect(catchItem.marketLocation).toBe('Mercato Ittico Adriatico');
      expect(catchItem.catchDate).toBeInstanceOf(Date);
    });
  });

  describe('Avviso Model', () => {
    it('should create an active notice banner with severity', async () => {
      const notice = await Avviso.create({
        title: 'Chiusura Straordinaria',
        message: 'Chiusi per maltempo in laguna',
        severity: 'warning',
        startDate: new Date(),
        isActive: true,
      });

      expect(notice._id).toBeDefined();
      expect(notice.severity).toBe('warning');
      expect(notice.isActive).toBe(true);
    });

    it('should reject invalid severity', async () => {
      const notice = new Avviso({
        title: 'Invalid Notice',
        message: 'Testing bad severity',
        severity: 'critical' as any,
      });

      let error: any;
      try {
        await notice.validate();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.severity).toBeDefined();
    });
  });

  describe('Evento Model', () => {
    it('should create a culinary event with date and pricing', async () => {
      const event = await Evento.create({
        title: 'Serata Degustazione Ostriche & Champagne',
        description: 'Percorso gourmet con sommelier',
        eventDate: new Date(Date.now() + 86400000 * 5),
        price: 90.0,
        maxSeats: 40,
        reservedSeats: 10,
        isActive: true,
      });

      expect(event._id).toBeDefined();
      expect(event.price).toBe(90.0);
      expect(event.reservedSeats).toBe(10);
      expect(event.maxSeats).toBe(40);
    });
  });

  describe('InfoLocale Model', () => {
    it('should store restaurant information, narrative and schedule', async () => {
      const info = await InfoLocale.create({
        name: 'Ristorante Il Veliero',
        historyStory: 'Storia autentica fondata nel 1982...',
        address: 'Lungomare Adriatico 42, Chioggia',
        phone: '+39 041 550 1234',
        email: 'info@ilveliero.it',
        coordinates: { lat: 45.2173, lng: 12.2778 },
      });

      expect(info._id).toBeDefined();
      expect(info.name).toBe('Ristorante Il Veliero');
      expect(info.openingHours.wednesday.isClosed).toBe(true);
      expect(info.openingHours.monday.isClosed).toBe(false);
      expect(info.coordinates.lat).toBe(45.2173);
    });
  });

  describe('TokenBlacklist Model', () => {
    it('should store revoked JWT token with expiration date', async () => {
      const revoked = await TokenBlacklist.create({
        token: 'sample.jwt.token.blacklisted.string',
        expiresAt: new Date(Date.now() + 3600000),
        reason: 'admin_revocation',
      });

      expect(revoked._id).toBeDefined();
      expect(revoked.token).toBe('sample.jwt.token.blacklisted.string');
      expect(revoked.reason).toBe('admin_revocation');
      expect(revoked.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('AuditLog Model', () => {
    it('should record an audit event with metadata', async () => {
      const log = await AuditLog.create({
        user: new mongoose.Types.ObjectId(),
        userEmail: 'bortolatofilippo05@gmail.com',
        role: 'admin',
        action: 'UPDATE_MENU_ITEM',
        resource: 'MENU',
        resourceId: 'dish-12345',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        details: { oldPrice: 18, newPrice: 20 },
        status: 'SUCCESS',
      });

      expect(log._id).toBeDefined();
      expect(log.action).toBe('UPDATE_MENU_ITEM');
      expect(log.status).toBe('SUCCESS');
      expect(log.details.oldPrice).toBe(18);
    });
  });
});
