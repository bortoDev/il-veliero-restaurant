import { seedDatabase } from '../../src/seed/seed';
import {
  User,
  MenuItem,
  Pescato,
  Avviso,
  Evento,
  InfoLocale,
  AuditLog,
} from '../../src/models';

describe('Database Seeding Engine Integration Test', () => {
  it('should seed default accounts, dishes, catches, notices, events, and restaurant info', async () => {
    await seedDatabase();

    // 1. Verify Users
    const users = await User.find({});
    expect(users.length).toBeGreaterThanOrEqual(3);

    const masterAdmin1 = await User.findOne({ email: 'bortolatofilippo05@gmail.com' });
    expect(masterAdmin1).toBeDefined();
    expect(masterAdmin1?.isMasterAdmin).toBe(true);
    expect(masterAdmin1?.role).toBe('admin');
    expect(await masterAdmin1?.comparePassword('AdminPass123!')).toBe(true);

    const masterAdmin2 = await User.findOne({ email: 'pizzadalcampione@gmail.com' });
    expect(masterAdmin2).toBeDefined();
    expect(masterAdmin2?.isMasterAdmin).toBe(true);
    expect(masterAdmin2?.role).toBe('admin');
    expect(await masterAdmin2?.comparePassword('AdminPass123!')).toBe(true);

    const legacyAdmin = await User.findOne({ email: 'admin@ilveliero.it' });
    expect(legacyAdmin).toBeNull();

    const gestore = await User.findOne({ $or: [{ email: 'gestore@ilveliero.it' }, { username: 'gestore_veliero' }] });
    expect(gestore).toBeDefined();
    expect(gestore?.role).toBe('gestore');
    expect(await gestore?.comparePassword('GestorePass123!')).toBe(true);

    const client = await User.findOne({ email: 'cliente@ilveliero.it' });
    expect(client).toBeDefined();
    expect(client?.role).toBe('client');
    expect(await client?.comparePassword('ClientPass123!')).toBe(true);

    // 2. Verify Menu Items
    const menuItems = await MenuItem.find({});
    expect(menuItems.length).toBeGreaterThanOrEqual(20);

    const categories = new Set(menuItems.map((item) => item.category));
    expect(categories.has('pesce')).toBe(true);
    expect(categories.has('carne')).toBe(true);
    expect(categories.has('contorni')).toBe(true);
    expect(categories.has('pizze')).toBe(true);
    expect(categories.has('vini')).toBe(true);

    // 3. Verify Pescato
    const catches = await Pescato.find({});
    expect(catches.length).toBeGreaterThanOrEqual(3);

    // 4. Verify Avvisi
    const avvisi = await Avviso.find({});
    expect(avvisi.length).toBeGreaterThanOrEqual(2);

    // 5. Verify Eventi
    const eventi = await Evento.find({});
    expect(eventi.length).toBeGreaterThanOrEqual(2);

    // 6. Verify InfoLocale
    const info = await InfoLocale.findOne({});
    expect(info).toBeDefined();
    expect(info?.name).toContain('Il Veliero');
    expect(info?.address).toContain('Bassano del Grappa');
    expect(info?.pIva).toBe('03450720242');
    expect(info?.sdi).toBe('P62QHVQ');
    expect(info?.openingHours.wednesday.isClosed).toBe(true);

    // 7. Verify AuditLog
    const auditLogs = await AuditLog.find({ action: 'SYSTEM_SEED' });
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].status).toBe('SUCCESS');
  });
});
