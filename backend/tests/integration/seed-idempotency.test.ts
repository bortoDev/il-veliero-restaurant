import { seedDatabase } from '../../src/seed/seed';
import {
  User,
  MenuItem,
  Pescato,
  Avviso,
  Evento,
  InfoLocale,
  AuditLog,
  TokenBlacklist,
  MENU_CATEGORIES,
} from '../../src/models';

describe('Seed Data Completeness & Idempotency Stress Test Suite', () => {
  describe('1. Repeated Seed Execution Idempotency', () => {
    it('should cleanly execute multiple times consecutively without duplicate keys or corrupt data', async () => {
      // Execute 3 times in a row to stress-test collection cleanup and re-insertion
      await seedDatabase();
      await seedDatabase();
      await seedDatabase();

      // 1. Users count (2 Master Admins, 2 Gestori, 1 Cliente)
      const userCount = await User.countDocuments();
      expect(userCount).toBe(5);

      // 2. InfoLocale count (Unique restaurant identity)
      const infoCount = await InfoLocale.countDocuments();
      expect(infoCount).toBe(1);

      // 3. Menu items count (All 196 authentic items)
      const menuCount = await MenuItem.countDocuments();
      expect(menuCount).toBe(196);

      // 4. Pescato del giorno items count
      const pescatoCount = await Pescato.countDocuments();
      expect(pescatoCount).toBe(3);

      // 5. Active announcement notices
      const avvisiCount = await Avviso.countDocuments();
      expect(avvisiCount).toBe(2);

      // 6. Upcoming culinary events
      const eventiCount = await Evento.countDocuments();
      expect(eventiCount).toBe(2);

      // 7. Audit log records (Exactly 1 for latest system seed)
      const auditCount = await AuditLog.countDocuments({ action: 'SYSTEM_SEED' });
      expect(auditCount).toBe(1);

      // 8. Token blacklist is clean
      const blacklistCount = await TokenBlacklist.countDocuments();
      expect(blacklistCount).toBe(0);
    });

    it('should maintain functional bcrypt passwords and valid roles after repeated seed execution', async () => {
      await seedDatabase();

      const admin1 = await User.findOne({ email: 'bortolatofilippo05@gmail.com' });
      expect(admin1).toBeDefined();
      expect(admin1?.role).toBe('admin');
      expect(admin1?.isMasterAdmin).toBe(true);
      expect(admin1?.isActive).toBe(true);
      expect(await admin1?.comparePassword('AdminPass123!')).toBe(true);

      const admin2 = await User.findOne({ email: 'pizzadalcampione@gmail.com' });
      expect(admin2).toBeDefined();
      expect(admin2?.role).toBe('admin');
      expect(admin2?.isMasterAdmin).toBe(true);
      expect(admin2?.isActive).toBe(true);
      expect(await admin2?.comparePassword('AdminPass123!')).toBe(true);

      const legacyAdmin = await User.findOne({ email: 'admin@ilveliero.it' });
      expect(legacyAdmin).toBeNull();

      const gestore = await User.findOne({ email: 'gestore@ilveliero.it' });
      expect(gestore).toBeDefined();
      expect(gestore?.role).toBe('gestore');
      expect(gestore?.isActive).toBe(true);
      expect(await gestore?.comparePassword('GestorePass123!')).toBe(true);

      const client = await User.findOne({ email: 'cliente@ilveliero.it' });
      expect(client).toBeDefined();
      expect(client?.role).toBe('client');
      expect(client?.isActive).toBe(true);
      expect(await client?.comparePassword('ClientPass123!')).toBe(true);
    });
  });

  describe('2. Menu Data Completeness Across 8 Authentic Categories', () => {
    it('should contain all authentic items and cover all 8 mandatory categories', async () => {
      await seedDatabase();

      const allDishes = await MenuItem.find({});
      expect(allDishes.length).toBe(196);

      // Verify all 8 categories exist in MENU_CATEGORIES
      const expectedCategories = [
        'pesce',
        'carne',
        'contorni',
        'pizze',
        'vini',
        'bevande',
        'insalatone',
        'piatti_estivi',
      ];
      for (const cat of expectedCategories) {
        expect(MENU_CATEGORIES).toContain(cat);
      }

      // Group by category and verify exact counts per restaurant photo catalog
      const countsByCategory: Record<string, number> = {};
      for (const dish of allDishes) {
        countsByCategory[dish.category] = (countsByCategory[dish.category] || 0) + 1;
      }

      expect(countsByCategory['pesce']).toBe(29);
      expect(countsByCategory['carne']).toBe(9);
      expect(countsByCategory['piatti_estivi']).toBe(3);
      expect(countsByCategory['contorni']).toBe(6);
      expect(countsByCategory['insalatone']).toBe(6);
      expect(countsByCategory['pizze']).toBe(65);
      expect(countsByCategory['vini']).toBe(28);
      expect(countsByCategory['bevande']).toBe(50);
    });

    it('should properly populate subcategories for all menu sections', async () => {
      await seedDatabase();
      const allDishes = await MenuItem.find({});

      // 1. Pesce subcategories (antipasti, crudo, primi, secondi, pescato_della_settimana)
      const pesceDishes = allDishes.filter((d) => d.category === 'pesce');
      const pesceSubcats = new Set(pesceDishes.map((d) => d.subcategory));
      expect(pesceSubcats.has('antipasti')).toBe(true);
      expect(pesceSubcats.has('crudo')).toBe(true);
      expect(pesceSubcats.has('primi')).toBe(true);
      expect(pesceSubcats.has('secondi')).toBe(true);
      expect(pesceSubcats.has('pescato_della_settimana')).toBe(true);

      // 2. Carne subcategories (antipasti, primi, secondi)
      const carneDishes = allDishes.filter((d) => d.category === 'carne');
      const carneSubcats = new Set(carneDishes.map((d) => d.subcategory));
      expect(carneSubcats.has('antipasti')).toBe(true);
      expect(carneSubcats.has('primi')).toBe(true);
      expect(carneSubcats.has('secondi')).toBe(true);

      // 3. Pizze subcategories (stagionali, classiche, della_casa, speciali, bianche, verdure)
      const pizzeDishes = allDishes.filter((d) => d.category === 'pizze');
      const pizzeSubcats = new Set(pizzeDishes.map((d) => d.subcategory));
      expect(pizzeSubcats.has('stagionali')).toBe(true);
      expect(pizzeSubcats.has('classiche')).toBe(true);
      expect(pizzeSubcats.has('della_casa')).toBe(true);
      expect(pizzeSubcats.has('speciali')).toBe(true);
      expect(pizzeSubcats.has('bianche')).toBe(true);
      expect(pizzeSubcats.has('vegetariane') || pizzeSubcats.has('verdure')).toBe(true);

      // Verify Finferli pizzas count is exactly 11 (#70 to #80)
      const finferliPizze = pizzeDishes.filter((p) => p.subcategory === 'stagionali');
      expect(finferliPizze.length).toBe(11);

      // 4. Insalatone gourmet count is exactly 6
      const insalatone = allDishes.filter((d) => d.category === 'insalatone');
      expect(insalatone.length).toBe(6);

      // 5. Vini subcategories (bollicine_charmat, bollicine_metodo_classico, bianchi, rossi, rosati)
      const viniDishes = allDishes.filter((d) => d.category === 'vini');
      const viniSubcats = new Set(viniDishes.map((d) => d.subcategory));
      expect(viniSubcats.has('bollicine_charmat')).toBe(true);
      expect(viniSubcats.has('bollicine_metodo_classico')).toBe(true);
      expect(viniSubcats.has('bianchi')).toBe(true);
      expect(viniSubcats.has('rossi')).toBe(true);
      expect(viniSubcats.has('rosati')).toBe(true);

      // 6. Bevande subcategories (caffetteria, bibite, birre, vino_sfuso, amari_grappe)
      const bevandeDishes = allDishes.filter((d) => d.category === 'bevande');
      const bevandeSubcats = new Set(bevandeDishes.map((d) => d.subcategory));
      expect(bevandeSubcats.has('caffetteria')).toBe(true);
      expect(bevandeSubcats.has('bibite')).toBe(true);
      expect(bevandeSubcats.has('birre')).toBe(true);
      expect(bevandeSubcats.has('vino_sfuso')).toBe(true);
      expect(bevandeSubcats.has('amari_grappe')).toBe(true);
    });

    it('should have valid allergen tags, allergen numbers 1-14, prices, and descriptions', async () => {
      await seedDatabase();

      const dishes = await MenuItem.find({});
      for (const dish of dishes) {
        expect(dish.title).toBeTruthy();
        expect(dish.description).toBeTruthy();
        expect(dish.price).toBeGreaterThan(0);
        expect(Array.isArray(dish.allergens)).toBe(true);

        // Verify allergenNumbers (if populated) only contains integers 1 through 14
        if ((dish as any).allergenNumbers && (dish as any).allergenNumbers.length > 0) {
          for (const num of (dish as any).allergenNumbers) {
            expect(typeof num).toBe('number');
            expect(num).toBeGreaterThanOrEqual(1);
            expect(num).toBeLessThanOrEqual(14);
          }
        }
      }
    });

    it('should spot-check authentic dishes from the photographic menu', async () => {
      await seedDatabase();

      // 1. Pizze di Stagione ai Finferli
      const pizza70 = await MenuItem.findOne({ title: { $regex: /#70/i } });
      expect(pizza70).toBeDefined();
      expect(pizza70?.category).toBe('pizze');
      expect(pizza70?.subcategory).toBe('stagionali');
      expect(pizza70?.price).toBe(14.0);

      // 2. Insalatona MELODY (with 250g Burrata)
      const insalataMelody = await MenuItem.findOne({ title: { $regex: /MELODY/i } });
      expect(insalataMelody).toBeDefined();
      expect(insalataMelody?.category).toBe('insalatone');
      expect(insalataMelody?.price).toBe(14.0);
      expect(insalataMelody?.description).toContain('250g');

      // 3. Pescato della Settimana (Dentice Crostoni)
      const dentice = await MenuItem.findOne({ title: { $regex: /dentice/i } });
      expect(dentice).toBeDefined();
      expect(dentice?.category).toBe('pesce');
      expect(dentice?.subcategory).toBe('pescato_della_settimana');
      expect(dentice?.price).toBe(9.0);

      // 4. Coperto
      const coperto = await MenuItem.findOne({ title: { $regex: /coperto/i } });
      expect(coperto).toBeDefined();
      expect(coperto?.category).toBe('contorni');
      expect(coperto?.price).toBe(3.0);

      // 5. Grappa Storica Nera
      const grappaStorica = await MenuItem.findOne({ title: { $regex: /Storica Nera/i } });
      expect(grappaStorica).toBeDefined();
      expect(grappaStorica?.category).toBe('bevande');
      expect(grappaStorica?.subcategory).toBe('amari_grappe');
      expect(grappaStorica?.price).toBe(5.5);

      // 6. Champagne Charles de Courcelle
      const champagne = await MenuItem.findOne({
        $or: [
          { title: { $regex: /Champagne/i } },
          { description: { $regex: /Charles de Courcelle/i } },
          { 'wineDetails.producer': { $regex: /Charles de Courcelle/i } },
        ],
      });
      expect(champagne).toBeDefined();
      expect(champagne?.category).toBe('vini');
      expect(champagne?.subcategory).toBe('bollicine_charmat');
      expect(champagne?.price).toBe(50.0);
    });
  });

  describe('3. Pescato, Avvisi, Eventi and InfoLocale Completeness', () => {
    it('should have valid PescatoDelGiorno items with locations, prices and availability', async () => {
      await seedDatabase();

      const catches = await Pescato.find({});
      expect(catches.length).toBe(3);
      for (const item of catches) {
        expect(item.title).toBeTruthy();
        expect(item.marketLocation).toBe('Mercato Ittico di Chioggia');
        expect(item.price).toBeGreaterThan(0);
        expect(item.kilogramsAvailable).toBeGreaterThan(0);
        expect(item.catchDate).toBeInstanceOf(Date);
        expect(item.isAvailable).toBe(true);
      }
    });

    it('should have valid active notices and upcoming culinary events', async () => {
      await seedDatabase();

      const notices = await Avviso.find({});
      expect(notices.length).toBe(2);
      for (const notice of notices) {
        expect(['info', 'warning', 'danger']).toContain(notice.severity);
        expect(notice.isActive).toBe(true);
        expect(notice.startDate).toBeInstanceOf(Date);
      }

      const events = await Evento.find({});
      expect(events.length).toBe(2);
      for (const event of events) {
        expect(event.price).toBeGreaterThan(0);
        expect(event.maxSeats).toBeGreaterThan(0);
        expect(event.reservedSeats).toBeGreaterThanOrEqual(0);
        expect(event.eventDate.getTime()).toBeGreaterThan(Date.now());
      }
    });

    it('should have restaurant info with valid opening schedule and GPS coordinates', async () => {
      await seedDatabase();

      const info = await InfoLocale.findOne({});
      expect(info).toBeDefined();
      expect(info?.name).toContain('Il Veliero');
      expect(info?.address).toContain('Bassano del Grappa');
      expect(info?.pIva).toBe('03450720242');
      expect(info?.sdi).toBe('P62QHVQ');
      expect(info?.email).toContain('@');
      expect(info?.openingHours.wednesday.isClosed).toBe(true);
      expect(info?.coordinates.lat).toBeCloseTo(45.7667, 2);
      expect(info?.coordinates.lng).toBeCloseTo(11.7333, 2);
    });
  });
});
