import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/environment';
import {
  User,
  MenuItem,
  Pescato,
  Avviso,
  Evento,
  InfoLocale,
  AuditLog,
  TokenBlacklist,
} from '../models';

export async function seedDatabase(): Promise<void> {
  try {
    console.log('⚓ Starting Il Veliero Database Seeding Process...');

    // 1. Connect to database
    await connectDatabase({ forceMemory: false });

    // 2. Clean existing records for fresh seed
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Pescato.deleteMany({}),
      Avviso.deleteMany({}),
      Evento.deleteMany({}),
      InfoLocale.deleteMany({}),
      AuditLog.deleteMany({}),
      TokenBlacklist.deleteMany({}),
    ]);

    // 3. Seed Users (Master Admins, Gestori, Cliente)
    console.log('[Seed] Creating default user accounts...');
    const masterAdmin1 = new User({
      name: 'Filippo Bortolato (Master Admin)',
      email: 'bortolatofilippo05@gmail.com',
      password: env.adminDefaults.password,
      role: 'admin',
      isMasterAdmin: true,
      isActive: true,
      tokenVersion: 0,
    });
    await masterAdmin1.save();

    const masterAdmin2 = new User({
      name: 'Federico Bortolato & Sabina Mazzeracca (Master Admin)',
      email: 'pizzadalcampione@gmail.com',
      password: env.adminDefaults.password,
      role: 'admin',
      isMasterAdmin: true,
      isActive: true,
      tokenVersion: 0,
    });
    await masterAdmin2.save();
    console.log('  ✓ Master Admin accounts initialized');

    const gestoreUser1 = new User({
      name: 'Gestore di Sala — Il Veliero',
      username: 'gestore_veliero',
      email: 'gestore@ilveliero.it',
      password: env.gestoreDefaults.password,
      role: 'gestore',
      isActive: true,
      tokenVersion: 0,
    });
    await gestoreUser1.save();

    const gestoreUser2 = new User({
      name: 'Responsabile Cucina',
      username: 'gestore',
      password: 'GestorePass123!',
      role: 'gestore',
      isActive: true,
      tokenVersion: 0,
    });
    await gestoreUser2.save();

    const clientUser = new User({
      name: 'Marco Bianchi — Cliente Fedele',
      email: env.clientDefaults.email,
      password: env.clientDefaults.password,
      role: 'client',
      isActive: true,
      tokenVersion: 0,
    });
    await clientUser.save();

    console.log(`  ✓ Master Admin account created: ${masterAdmin1.email}`);
    console.log(`  ✓ Secondary Master Admin created: ${masterAdmin2.email}`);
    console.log(`  ✓ Gestore account created: username='${gestoreUser1.username}'`);
    console.log(`  ✓ Gestore account created: username='${gestoreUser2.username}'`);
    console.log(`  ✓ Client account created: ${clientUser.email}`);

    // 4. Seed InfoLocale & Restaurant Story (Bassano del Grappa Real Data)
    console.log('[Seed] Seeding Bassano del Grappa restaurant information and historical narrative...');
    const infoLocale = await InfoLocale.create({
      name: 'Il Veliero — Ristorante & Pizzeria dal Campione del Mondo',
      legalName: 'Pizza dal Campione del Mondo s.n.c. di Bortolato Federico e Mazzeracca Sabina',
      pIva: '03450720242',
      sdi: 'P62QHVQ',
      historyStory: `Guidato dal Maestro Federico Bortolato, Campione del Mondo della Pizza, e da Sabina Mazzeracca, il ristorante e pizzeria "Il Veliero" a Bassano del Grappa rappresenta il connubio perfetto tra la grande cucina marinara dell'Adriatico e l'eccellenza dell'arte bianca cotta in forno a legna.

Nel 1998 ha inizio il nostro viaggio culinario con la ricerca maniacale dei migliori impasti a lievitazione naturale e l'amore per il pesce fresco. Nel 2014 arriva la consacrazione internazionale con la conquista del titolo iridato di Campione del Mondo della Pizza da parte di Federico Bortolato. Nel 2026 rinnoviamo la nostra promessa di qualità introducendo il nostro esclusivo "Diario di Bordo" con gli arrivi giornalieri del pescato dal mercato. Benvenuti a bordo a Bassano del Grappa!`,
      historicalEras: [
        {
          year: '1998',
          title: "Le Origini & La Passione per il Mare",
          subtitle: "La Nascita dell'Idea",
          badge: 'Le Origini',
          narrative: [
            "Tutto ha inizio dalla profonda ammirazione per la tradizione marinara dell'Adriatico. L'idea fondante di Federico Bortolato e Sabina Mazzeracca è stata quella di portare l'autenticità del pescato fresco di paranza e la convivialità della trattoria di mare sulle tavole dell'entroterra veneto.",
            "Fin dai primi anni, la ricerca ossessiva della materia prima freschissima e il rispetto dei tempi naturali di cottura hanno caratterizzato l'identità del Veliero.",
          ],
          achievements: [
            'Apertura del primo locale con focus sul pescato fresco',
            'Creazione delle prime ricette di marinature a crudo e fritture',
            'Consolidamento della clientela locale a Bassano del Grappa',
          ],
          quote: 'Il mare non è solo una cucina: è un modo di vivere, ascoltare e rispettare la natura.',
          quoteAuthor: 'Sabina Mazzeracca',
          image: 'assets/videos/card-pescato-poster.jpg',
        },
        {
          year: '2014',
          title: "Il Titolo di Campione del Mondo della Pizza",
          subtitle: "Il Trionfo dell'Arte Bianca",
          badge: 'Il Titolo Mondiale',
          narrative: [
            'Dopo anni di studio meticoloso sugli impasti, sulle fermentazioni a temperatura controllata e sulle miscele di farine macinate a pietra, Federico Bortolato conquista il prestigioso titolo di Campione del Mondo della Pizza.',
            'Nasce così la formula unica de "Il Veliero — Ristorante & Pizzeria dal Campione del Mondo", dove il pesce fresco di giornata incontra la vera pizza napoletana cotta nel forno a legna.',
          ],
          achievements: [
            'Vittoria del Campionato Mondiale della Pizza con impasto speciale',
            'Installazione del forno a legna refrattario artigianale',
            'Nascita del connubio esclusivo "Cucina Marinara & Pizza d\'Autore"',
          ],
          quote: "L'impasto perfetto è come la navigazione: richiede pazienza, cura dei dettagli e passione costante.",
          quoteAuthor: 'Federico Bortolato, Campione del Mondo',
          image: 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg',
        },
        {
          year: '2026',
          title: 'Il Veliero Oggi: Tradizione & Futuro',
          subtitle: 'La Nuova Dimensione Digitale',
          badge: 'Il Presente',
          narrative: [
            'Oggi Il Veliero in Via G. Fattori 7 a Bassano del Grappa (San Michele) rappresenta un punto di riferimento indiscusso. Con il nuovo Diario di Bordo digitale, i clienti possono scoprire in tempo reale gli arrivi del mercato ittico e prenotare le loro serate enogastronomiche.',
            'La passione di Federico e Sabina continua immutata, arricchita da una cantina con oltre 120 etichette e una continua innovazione nel rispetto della tradizione.',
          ],
          achievements: [
            'Lancio del Diario di Bordo interattivo con aggiornamenti quotidiani',
            'Menu arricchito con opzioni per tutti i regimi alimentari e allergeni',
            'Oltre 25 anni di eccellenza e accoglienza a Bassano del Grappa',
          ],
          quote: 'Ogni giorno a bordo del nostro Veliero è una nuova avventura gastronomica da condividere insieme.',
          quoteAuthor: 'Federico & Sabina',
          image: 'assets/videos/card-dove-siamo-poster.jpg',
        },
      ],
      mosaicItems: [
        {
          id: 'mosaic_1',
          tag: 'Arte Bianca',
          title: 'Il Forno a Legna del Campione',
          description: 'Cottura a 450°C, lievitazione naturale e farine italiane non raffinate per una pizza soffice e altamente digeribile.',
          image: 'assets/images/logos/LogoPizzeriaDalCampioneDelMondo.jpg',
          type: 'large',
        },
        {
          id: 'mosaic_2',
          tag: 'Selezione Quotidiana',
          title: "La Scelta all'Asta Ittica",
          description: 'Dentici, orate, branzini e calamaretti spillo scelti ogni alba per garantire freschezza assoluta.',
          icon: 'fa-solid fa-fish-fins',
        },
        {
          id: 'mosaic_3',
          tag: 'Accoglienza',
          title: 'Sabina Mazzeracca & lo Staff',
          description: 'Un servizio premuroso e caloroso in un ambiente nautico curato in ogni dettaglio.',
          icon: 'fa-solid fa-wine-glass',
        },
        {
          id: 'mosaic_4',
          tag: 'Il Nostro Porto',
          title: 'Radici Salde a Bassano del Grappa',
          description: 'In Via G. Fattori 7 (Località San Michele), accogliamo ogni giorno amanti del buon cibo, famiglie e intenditori con il calore della vera trattoria marinara veneta.',
          type: 'wide',
        },
      ],
      address: 'Via G. Fattori 7 - Località San Michele, 36061 Bassano del Grappa (VI)',
      city: 'Bassano del Grappa',
      province: 'VI',
      postalCode: '36061',
      phone: '0424 500 200',
      mobile: '334 623 2941',
      whatsapp: '334 623 2941',
      email: 'pizzadalcampione@gmail.com',
      secondaryEmail: '',
      openingHours: {
        monday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        tuesday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        wednesday: { lunch: { open: '', close: '' }, dinner: { open: '', close: '' }, isClosed: true },
        thursday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        friday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        saturday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        sunday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
        notes:
          'Orari Cucina: Pranzo 12:00-14:00 | Cena 19:00-22:00 (la cucina non fa pasti fuori da questi orari; la pizzeria può aprire leggermente prima o chiudere dopo). Chiuso il Mercoledì per riposo settimanale.',
      },
      coordinates: {
        lat: 45.7667,
        lng: 11.7333,
      },
      socialLinks: {
        facebook: 'https://facebook.com/ilvelierobassano',
        instagram: 'https://www.instagram.com/ilvelierotrattoria',
        whatsapp: 'https://wa.me/393346232941',
        tripadvisor: '',
      },
    });
    console.log(`  ✓ InfoLocale initialized for ${infoLocale.name}`);

    // 5. Seed Authentic Menu Items (All 196 dishes transcribed from photographs)
    console.log('[Seed] Seeding authentic restaurant dishes across all 8 categories...');
    const menuItems = [
  {
    "title": "Schie fritte e polenta",
    "description": "I tradizionali gamberetti grigi della laguna veneta fritti croccanti e serviti con morbida polenta bianca fumante.",
    "price": 10,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "crostacei",
      "glutine"
    ],
    "allergenNumbers": [
      2,
      4
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/schie-polenta.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Sardine dell'Adriatico fritte",
    "description": "10 pezzi di sardine fresche dell'Adriatico, aperte e fritte dorate con sale marino e spicchi di limone fresco.",
    "price": 8,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "pesce",
      "glutine"
    ],
    "allergenNumbers": [
      1,
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/sardine-fritte.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Alici marinate in Olio Evo",
    "description": "Filetti di alici nostrane marinate all'aceto di mela e olio extravergine, servite con peperoncini dolci e crostini di pane.",
    "price": 9,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "pesce",
      "glutine",
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      1,
      4,
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/alici-marinate.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Cozze nostrane e vongole alla tarantina",
    "description": "Cozze nostrane e vongole veraci in salsa rossa leggermente piccante con pomodoro San Marzano e crostoni di pane casereccio.",
    "price": 20,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "molluschi",
      "glutine"
    ],
    "allergenNumbers": [
      3,
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/cozze-vongole-tarantina.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Impepata di cozze nostrane",
    "description": "Cozze nostrane aperte a vapore in rosso con pepe nero macinato fresco, aglio dolce e crostini di pane dorati.",
    "price": 14,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "molluschi",
      "glutine"
    ],
    "allergenNumbers": [
      3,
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/impepata-cozze.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Capesante nostrane al brandy",
    "description": "3 pezzi di capesante nostrane dell'Adriatico scottate e sfumate al brandy con emulsione al burro ed erbe aromatiche.",
    "price": 15,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "molluschi",
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      3,
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/capesante-brandy.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Vassoio di Mare",
    "description": "Capasanta Reale (2 pezzi), Canestrelli dell'Adriatico (6 pezzi) sfumati al Brandy e serviti con polenta abbrustolita.",
    "price": 20,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "molluschi",
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      3,
      12
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/vassoio-mare.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Insalata di Mare",
    "description": "Delicata insalata di mare con piovra verace, seppia nostrana, cozze e mazzancolle al vapore, condite con olio EVO e limone.",
    "price": 17,
    "category": "pesce",
    "subcategory": "antipasti",
    "allergens": [
      "crostacei",
      "molluschi"
    ],
    "allergenNumbers": [
      2,
      3
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-mare.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "6/12 Scampetti",
    "description": "Scampetti crudi freschissimi di Chioggia abbattuti a norma (porzione 6 pezzi €14.00, 12 pezzi €28.00).",
    "price": 14,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "crostacei"
    ],
    "allergenNumbers": [
      2
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/scampetti-crudi.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Tartare di Tonno Pinne Gialle",
    "description": "Tartare di tonno pinne gialle tagliato al coltello con emulsione agli agrumi (porzione antipasto €15.00, secondo piatto €28.00).",
    "price": 15,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/tartare-tonno.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Tartare di Gambero Rosso",
    "description": "Tartare di gambero rosso freschissimo da antipasto, servita con 2 gamberi interi e sale Maldon.",
    "price": 16,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "crostacei"
    ],
    "allergenNumbers": [
      2
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/tartare-gambero-rosso.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Gambero Rosso di Mazara del Vallo",
    "description": "Gambero rosso freschissimo di Mazara del Vallo servito crudo al pezzo con gocce di lime.",
    "price": 3.5,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "crostacei"
    ],
    "allergenNumbers": [
      2
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/gambero-mazara.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Ostriche Nostrane",
    "description": "Ostriche nostrane freschissime al pezzo, servite aperte su ghiaccio tritato con limone.",
    "price": 4,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "molluschi"
    ],
    "allergenNumbers": [
      3
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/ostriche.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Carpaccio di Salmone Norvegese",
    "description": "Salmone norvegese pescato tagliato finissimo, marinato al pepe rosa, aneto e olio all'arancia.",
    "price": 16,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/carpaccio-salmone.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Carpaccio di Pesce Spada",
    "description": "Carpaccio di pesce spada affumicato tagliato sottile con rucola selvatica, bacche di pepe rosa e olio EVO.",
    "price": 14,
    "category": "pesce",
    "subcategory": "crudo",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/carpaccio-spada.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Spaghetti con Vongole Veraci",
    "description": "Spaghetti trafilati al bronzo mantecati con abbondanti vongole veraci fresche in guazzetto di aglio, olio e prezzemolo.",
    "price": 18,
    "category": "pesce",
    "subcategory": "primi",
    "allergens": [
      "molluschi",
      "glutine"
    ],
    "allergenNumbers": [
      3,
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/spaghetti-vongole.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Linguine allo Scoglio",
    "description": "Linguine ricche con frutti di mare, cozze, vongole, scampi, calamaretti e pescato fresco in salsa di pomodorini.",
    "price": 22,
    "category": "pesce",
    "subcategory": "primi",
    "allergens": [
      "pesce",
      "crostacei",
      "molluschi",
      "glutine"
    ],
    "allergenNumbers": [
      1,
      2,
      3,
      4
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/linguine-scoglio.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Risotto alla Pescatora con Capasanta Reale",
    "description": "Riso Carnaroli mantecato all'onda alla marinara con bisque di crostacei, frutti di mare e Capasanta Reale (Min. 2 persone, prezzo a persona).",
    "price": 23,
    "category": "pesce",
    "subcategory": "primi",
    "allergens": [
      "crostacei",
      "molluschi",
      "latte"
    ],
    "allergenNumbers": [
      2,
      3,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/risotto-pescatora.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Fritto Misto Reale",
    "description": "Anelli e teste di calamaro nostrano, Capasanta, gamberi, pescato della settimana e verdure pastellate croccanti.",
    "price": 22,
    "category": "pesce",
    "subcategory": "secondi",
    "allergens": [
      "pesce",
      "crostacei",
      "molluschi",
      "glutine"
    ],
    "allergenNumbers": [
      1,
      2,
      3,
      4
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/fritto-misto.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Tris Il Veliero",
    "description": "Tris degustazione marinara: Insalata di Mare, Seppia alla griglia, Capasanta alla griglia e polenta bianca abbrustolita.",
    "price": 18,
    "category": "pesce",
    "subcategory": "secondi",
    "allergens": [
      "crostacei",
      "molluschi"
    ],
    "allergenNumbers": [
      2,
      3
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/tris-veliero.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Piatto \"De Chioggia\"",
    "description": "Gran piatto unico della tradizione chioggiotta: Calamari in umido con polenta, crostini con crema di dentice, spiedino di mazzancolle, seppia alla griglia, crostini con salmone marinato, canestrelli alla griglia e carpaccio di spada affumicato.",
    "price": 36,
    "category": "pesce",
    "subcategory": "secondi",
    "allergens": [
      "pesce",
      "crostacei",
      "molluschi",
      "glutine",
      "uova"
    ],
    "allergenNumbers": [
      1,
      2,
      3,
      4,
      5
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/piatto-de-chioggia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Filetto di Branzino Pescato alla Griglia",
    "description": "Filetto di branzino selvaggio pescato cotto alla griglia a fuoco vivo, servito con patate al forno profumate al rosmarino.",
    "price": 20,
    "category": "pesce",
    "subcategory": "secondi",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/branzino-griglia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grigliata di Pesce per 2 persone",
    "description": "Piatto imperiale per 2 persone: Capasanta (2pz), Seppia nostrana (2pz), Scampo Reale (2pz), Spiedino di Mazzancolle (2pz), Filetto di Branzino (2pz) e fette di polenta abbrustolita.",
    "price": 46,
    "category": "pesce",
    "subcategory": "secondi",
    "allergens": [
      "pesce",
      "crostacei",
      "molluschi"
    ],
    "allergenNumbers": [
      1,
      2,
      3
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/grigliata-pesce.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Calamari Nostrani in Umido",
    "description": "Teneri calamari nostrani stufati a fuoco lento in rosso con pomodoro e vino bianco, serviti con polenta morbida veneta.",
    "price": 18,
    "category": "pesce",
    "subcategory": "secondi",
    "allergens": [
      "crostacei",
      "molluschi"
    ],
    "allergenNumbers": [
      2,
      3
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/calamari-umido.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Crostoni Pane Pizza con Crema di Dentice",
    "description": "Crostoni caldi di pasta pizza cotti a legna con morbida spuma di dentice fresco dell'Adriatico e timo.",
    "price": 9,
    "category": "pesce",
    "subcategory": "pescato_della_settimana",
    "allergens": [
      "pesce",
      "glutine"
    ],
    "allergenNumbers": [
      1,
      4
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/crostoni-dentice.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "6 Canocce Crude",
    "description": "6 cicale di mare nostrane freschissime servite crude con emulsione di limone e olio extravergine.",
    "price": 7,
    "category": "pesce",
    "subcategory": "pescato_della_settimana",
    "allergens": [
      "crostacei"
    ],
    "allergenNumbers": [
      2
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/canocce-crude.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Paccheri Freschi al Pesto con Mazzancolle e Ricotta Affumicata",
    "description": "Paccheri di pasta fresca al pesto genovese con mazzancolle saltate in padella e pioggia di ricotta affumicata a scaglie.",
    "price": 16.5,
    "category": "pesce",
    "subcategory": "pescato_della_settimana",
    "allergens": [
      "crostacei",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      2,
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/paccheri-mazzancolle.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Tagliata di Tonno Pinne Gialle",
    "description": "Trancio di tonno pinne gialle scottato alla griglia con cuore rosato, servito con patate al forno.",
    "price": 24,
    "category": "pesce",
    "subcategory": "pescato_della_settimana",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/tagliata-tonno.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Soaso Intero Pescato alla Griglia",
    "description": "Rombo liscio (soaso) intero pescato nel mare Adriatico, cotto alla griglia e accompagnato da patate al forno dorate.",
    "price": 30,
    "category": "pesce",
    "subcategory": "pescato_della_settimana",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/soaso-griglia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Filetto di Bresaola (Petto d'anca)",
    "description": "Pregiata bresaola punta d'anca a fette sottili con rucola selvatica, scaglie di Grana Padano DOP e olio EVO.",
    "price": 10,
    "category": "carne",
    "subcategory": "antipasti",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/bresaola-grana.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Antipasto all'Italiana",
    "description": "Tagliere di affettati misti della casa, formaggio stagionato veneto e giardiniera di verdure all'aceto.",
    "price": 12,
    "category": "carne",
    "subcategory": "antipasti",
    "allergens": [
      "glutine",
      "latte",
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      4,
      6,
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/antipasto-italiana.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Tagliolini all'Uovo",
    "description": "Tagliolini freschi all'uovo fatti a mano con sugo di pomodoro fresco o ricco ragù di manzo della tradizione.",
    "price": 10,
    "category": "carne",
    "subcategory": "primi",
    "allergens": [
      "glutine",
      "uova",
      "sedano"
    ],
    "allergenNumbers": [
      4,
      5,
      7
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/tagliolini-ragu.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Spaghetti alla Carbonara",
    "description": "Spaghetti alla carbonara con guanciale croccante, tuorlo d'uovo pastorizzato, Pecorino Romano DOP e pepe nero macinato al momento.",
    "price": 12,
    "category": "carne",
    "subcategory": "primi",
    "allergens": [
      "glutine",
      "uova",
      "latte"
    ],
    "allergenNumbers": [
      4,
      5,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/carbonara.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Gnocchi di Patate",
    "description": "Gnocchi di patate fresche fatti in casa con sugo di ragù di manzo o salsa al pomodoro e basilico.",
    "price": 10,
    "category": "carne",
    "subcategory": "primi",
    "allergens": [
      "glutine",
      "sedano"
    ],
    "allergenNumbers": [
      4,
      7
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/gnocchi-patate.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Tagliata di Manzo al Rosmarino",
    "description": "Tagliata di manzo selezionato alla griglia con emulsione al rosmarino, patate al forno e polenta abbrustolita.",
    "price": 24,
    "category": "carne",
    "subcategory": "secondi",
    "allergens": [
      "senape"
    ],
    "allergenNumbers": [
      8
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/tagliata-manzo.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Braccioline d'Agnello Scalzate alla Griglia",
    "description": "Costolette d'agnello scalzate e cotte alla brace, servite con patate al forno croccanti.",
    "price": 18,
    "category": "carne",
    "subcategory": "secondi",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/agnello-griglia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Cotoletta di Maiale",
    "description": "Cotoletta di maiale impanata alla milanese dorata nel burro, servita con patate al forno.",
    "price": 10,
    "category": "carne",
    "subcategory": "secondi",
    "allergens": [
      "glutine",
      "uova"
    ],
    "allergenNumbers": [
      4,
      5
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/cotoletta-maiale.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Petto di Pollo alla Griglia",
    "description": "Petto di pollo cotto ai ferri alla griglia, servito con contorno di patate al forno.",
    "price": 10,
    "category": "carne",
    "subcategory": "secondi",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pollo-griglia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Cous Cous con Verdure e Mazzancolle",
    "description": "Semola di cous cous aromatizzata con verdure fresche estive spadellate e mazzancolle croccanti.",
    "price": 14,
    "category": "piatti_estivi",
    "subcategory": "piatti_estivi",
    "allergens": [
      "crostacei",
      "glutine"
    ],
    "allergenNumbers": [
      2,
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/couscous-mazzancolle.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Roast-beef di Black Angus",
    "description": "Pregiato roast-beef di Black Angus servito freddo all'inglese oppure con rucola selvatica e scaglie di grana.",
    "price": 16,
    "category": "piatti_estivi",
    "subcategory": "piatti_estivi",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/roastbeef-angus.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Caprese con Pomodori Cuore di Bue",
    "description": "Pomodori cuore di bue a fette, mozzarelline fior di latte nostrane, foglie di basilico fresco e olio extravergine.",
    "price": 13,
    "category": "piatti_estivi",
    "subcategory": "piatti_estivi",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/caprese.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Patate al Forno",
    "description": "Patate a spicchi con buccia cotte e dorate al forno con rametti di rosmarino fresco e sale marino.",
    "price": 4.5,
    "category": "contorni",
    "subcategory": "contorni",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/patate-forno.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Patate Fritte",
    "description": "Patatine fritte dorate e croccanti in olio vegetale ad alta temperatura.",
    "price": 5,
    "category": "contorni",
    "subcategory": "contorni",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/patate-fritte.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Macedonia di Verdure Cotte al Forno",
    "description": "Selezione mista di verdure fresche dell'orto cotte al forno con erbe aromatiche e olio EVO.",
    "price": 5,
    "category": "contorni",
    "subcategory": "contorni",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/verdure-forno.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Contorno di Stagione",
    "description": "Verdure fresche di stagione a cura dello chef (prezzo variabile €6.00–€8.00 in base alla disponibilità del mercato).",
    "price": 7,
    "category": "contorni",
    "subcategory": "contorni",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/contorno-stagione.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Insalata Mista",
    "description": "Misticanza fresca con carote alla julienne, pomodori datterini e finocchi croccanti.",
    "price": 5,
    "category": "contorni",
    "subcategory": "contorni",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-mista.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Coperto",
    "description": "Servizio al tavolo, pane artigianale fresco e grissini (Non si effettuano modifiche ai piatti).",
    "price": 3,
    "category": "contorni",
    "subcategory": "coperto",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/coperto.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#CINZIA",
    "description": "Insalata Armonia, Carote alla julienne, Cipolla rossa di Tropea, Olive greche, Ricotta affumicata a scaglie, Trancetti di Tonno.",
    "price": 12,
    "category": "insalatone",
    "subcategory": "insalatone",
    "allergens": [
      "pesce",
      "latte"
    ],
    "allergenNumbers": [
      1,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-cinzia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "#MARA",
    "description": "Insalata Armonia, Pomodori cuore di bue, Carote alla julienne, Mais dolce, Olive greche, Carciofini grigliati, Mozzarelline fior di latte nostrane.",
    "price": 12,
    "category": "insalatone",
    "subcategory": "insalatone",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-mara.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "#FABIOLA",
    "description": "Insalata Armonia, Pomodori cuore di bue, Carote alla julienne, Tonno, Cipolla rossa di Tropea, Funghi champignon freschi, Grana Padano a scaglie, Foglie di Basilico.",
    "price": 14,
    "category": "insalatone",
    "subcategory": "insalatone",
    "allergens": [
      "pesce",
      "latte"
    ],
    "allergenNumbers": [
      1,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-fabiola.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "#MELODY",
    "description": "Insalata Armonia, Rucola selvatica, Pomodori cuore di bue, Carote alla julienne, Cetrioli, Alici di Sciacca e un'intera Burrata Pugliese da 250g.",
    "price": 14,
    "category": "insalatone",
    "subcategory": "insalatone",
    "allergens": [
      "pesce",
      "latte"
    ],
    "allergenNumbers": [
      1,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-melody.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "#RAFFAELLA",
    "description": "Insalata Armonia, Carote alla julienne, Germogli di soia, Mais dolce, Pomodorini secchi di Sicilia, Avocado fresco, Foglie di Basilico.",
    "price": 14,
    "category": "insalatone",
    "subcategory": "insalatone",
    "allergens": [
      "soia"
    ],
    "allergenNumbers": [
      14
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-raffaella.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "#IRENE",
    "description": "Rucola selvatica, Carote alla julienne, Pomodorini datterini, Cipolla rossa di Tropea, Avocado e morbido Carpaccio di Salmone marinato.",
    "price": 15,
    "category": "insalatone",
    "subcategory": "insalatone",
    "allergens": [
      "pesce"
    ],
    "allergenNumbers": [
      1
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/insalata-irene.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "#70",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio COMALAT, Finferli freschi trifolati, Crema formaggi e Porchetta trevigiana.",
    "price": 14,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-70.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#71",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Burrata pugliese e Salsiccia fresca nostrana.",
    "price": 15.5,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-71.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#72",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Stracchino cremoso e Pancetta arrotolata al pepe.",
    "price": 14,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-72.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#73",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Gorgonzola DOP e Speck affumicato dell'Alto Adige.",
    "price": 14,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-73.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#74",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Burrata pugliese e Prosciutto Crudo San Daniele DOP stagionato 36 mesi.",
    "price": 16,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-74.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#75",
    "description": "Crema di Zucca dolce, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Scamorza e Peperoni grigliati.",
    "price": 14.5,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-75.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#76",
    "description": "NO SUGO (Pizza Bianca), Mozzarella fresca Caseificio COMALAT, Finferli freschi, Gorgonzola DOP e Noci tostate.",
    "price": 13.5,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte",
      "frutta_a_guscio"
    ],
    "allergenNumbers": [
      4,
      6,
      10
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-76.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#77",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Mazzancolle sgusciate e Ricotta affumicata a scaglie.",
    "price": 16,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "crostacei",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      2,
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-77.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#78",
    "description": "Base Bufalona (Mozzarella di bufala campana DOP) con aggiunta di Finferli freschi, Crudo San Daniele DOP 36 mesi e Ricotta affumicata a scaglie.",
    "price": 16,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-78.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#79",
    "description": "Crema di Zucca, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Spianata calabra piccante, Scamorza affumicata.",
    "price": 15,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-79.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "#80",
    "description": "Crema di Zucca, Mozzarella fresca Caseificio COMALAT, Finferli freschi, Bresaola punta d'anca, Rucola selvatica.",
    "price": 14,
    "category": "pizze",
    "subcategory": "stagionali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-80.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Margherita",
    "description": "Pomodoro San Marzano DOP, Mozzarella fresca Caseificio Comalat, basilico fresco e giro d'olio EVO.",
    "price": 6,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-margherita.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Romana",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, filetti di Alici siciliane in olio d'oliva e origano.",
    "price": 8.5,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "pesce",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      1,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-romana.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Diavola",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Spianata calabra piccante.",
    "price": 9,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-diavola.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Capricciosa",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Prosciutto cotto di Praga, Funghi champignon freschi e Carciofi grigliati.",
    "price": 12,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-capricciosa.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Rustica",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Cipolla di Tropea e Trancetti di Tonno.",
    "price": 10,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "pesce",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      1,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-rustica.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Prateria",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Prosciutto cotto di Praga, Funghi champignon e Spianata calabra piccante.",
    "price": 12,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-prateria.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Siciliana",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, filetti di Alici siciliane in olio d'oliva, Olive verdi e nere, Capperi.",
    "price": 12,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "pesce",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      1,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-siciliana.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Bufalona",
    "description": "Pomodoro San Marzano, Mozzarella di bufala campana DOP e basilico fresco.",
    "price": 9,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-bufalona.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "4 Formaggi",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Gorgonzola DOP, Formaggio Brie e Crema Formaggi.",
    "price": 13,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-4formaggi.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Estiva",
    "description": "Pomodoro San Marzano, Mozzarella Caseificio Comalat, Rucola selvatica, scaglie di Grana Padano DOP e Pomodorini Pachino.",
    "price": 13,
    "category": "pizze",
    "subcategory": "classiche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-estiva.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Palladio",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Speck affumicato croccante, Asiago DOP e Carciofi grigliati.",
    "price": 13,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-palladio.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Ariete",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Prosciutto cotto di Praga, Patate al forno e scaglie di Grana.",
    "price": 12,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-ariete.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Mazzancolle",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Mazzancolle fresche.",
    "price": 11,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "crostacei",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      2,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-mazzancolle.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Frutti di Mare",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Piovra, Seppia nostrana e Mazzancolle fresche.",
    "price": 18,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "crostacei",
      "molluschi",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      2,
      3,
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-frutti-mare.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Nemo",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Mazzancolle, Crema Philadelphia e Rucola selvatica.",
    "price": 15,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "crostacei",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      2,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-nemo.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Speciale",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Prosciutto Crudo San Daniele DOP 36 mesi, Cipolla di Tropea, Funghi Chiodini, Scamorza affumicata.",
    "price": 15,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-speciale.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "La Classica",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Burrata pugliese, Zucchine grigliate e Pomodorini Pachino.",
    "price": 14,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-laclassica.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Valtellina",
    "description": "Pomodoro San Marzano, Mozzarella Caseificio Comalat, Bresaola punta d'anca, Burrata pugliese, Pomodoro a fette e Rucola selvatica.",
    "price": 17,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-valtellina.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Silvia",
    "description": "Pomodoro San Marzano, Mozzarella Caseificio Comalat, Ricotta affumicata a scaglie e Basilico fresco.",
    "price": 9,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-silvia.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Parmigiana",
    "description": "Pomodoro San Marzano, Mozzarella Caseificio Comalat, Crudo San Daniele DOP 36 mesi, Grana Padano a scaglie e Melanzane grigliate.",
    "price": 14,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-parmigiana.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Latis",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Pomodorini Pachino, Stracchino fresco e Rucola selvatica.",
    "price": 13,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-latis.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Burratina",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Pomodorini Pachino, Rucola selvatica e Burrata pugliese intera.",
    "price": 14,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-burratina.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Altopiano",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Formaggio Asiago DOP, Speck affumicato e Funghi Chiodini.",
    "price": 14,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-altopiano.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Totti",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Asiago DOP, Porchetta trevigiana, Bovis e Funghi Chiodini.",
    "price": 14,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-totti.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Barbie",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Pomodorini Pachino, Philadelphia e Crudo San Daniele DOP 36 mesi.",
    "price": 13,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-barbie.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Lupen",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Prosciutto cotto di Praga, Philadelphia e Zucchine grigliate.",
    "price": 13,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-lupen.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Taiti",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Pomodorini secchi di Sicilia, Philadelphia e Rucola selvatica.",
    "price": 12,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-taiti.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Zorro",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Crema Philadelphia e Patate fritte croccanti.",
    "price": 10.5,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-zorro.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Zola",
    "description": "Pomodoro San Marzano, Mozzarella Caseificio Comalat, Speck affumicato dell'Alto Adige e Gorgonzola DOP.",
    "price": 10.5,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-zola.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Cassiopea",
    "description": "Pomodoro San Marzano, Mozzarella Caseificio Comalat, Peperoni grigliati, Porchetta, Bovis e scaglie di Grana Padano.",
    "price": 14,
    "category": "pizze",
    "subcategory": "della_casa",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-cassiopea.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Atomica",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Trancetti di Tonno, Würstel, Spianata calabra, filetti di Alici siciliane, Olive miste, Capperi e Origano.",
    "price": 17,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "pesce",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      1,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-atomica.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Buongustaia",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Melanzane grigliate, Crema formaggi, Funghi Porcini e Speck affumicato.",
    "price": 16,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-buongustaia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Pifferaia",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Formaggio Brie, Rucola selvatica e Bresaola punta d'anca.",
    "price": 13,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-pifferaia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Giulia",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Pomodorini Pachino, Stracchino cremoso e Crudo San Daniele DOP 36 mesi.",
    "price": 13,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-giulia.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Tropea",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Cipolla rossa di Tropea, Salsiccia fresca e Asiago DOP.",
    "price": 14,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-tropea.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Vesuvio",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Peperoni grigliati, Olive verdi, Spianata calabra piccante e scaglie di Grana.",
    "price": 14,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-vesuvio.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Greca",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Trancetti di Tonno, Cipolla rossa di Tropea, Peperoni grigliati e Formaggio Brie.",
    "price": 14,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "pesce",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      1,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-greca.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Billy",
    "description": "Pomodoro San Marzano, Mozzarella di bufala campana DOP, Carciofi grigliati e Crudo San Daniele DOP 36 Mesi.",
    "price": 14,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-billy.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Campione",
    "description": "Pizza d'autore di Federico Bortolato: Pomodoro San Marzano, Mozzarella Caseificio Comalat, Spianata calabra piccante, Funghi Chiodini, Rucola selvatica e scaglie di Grana Padano DOP.",
    "price": 14.5,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-campione.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "West",
    "description": "Speciale del Maestro: Pomodoro San Marzano, Mozzarella fresca, Misto bosco con funghi profumati, Crema formaggi e Salsiccia.",
    "price": 15,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-west.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "2024",
    "description": "Speciale della casa: Pomodoro, Mozzarella fresca, Radicchio trevigiano, Ricotta affumicata grattugiata a scaglie e Crudo San Daniele DOP.",
    "price": 12.5,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-2024.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "2025",
    "description": "Speciale della casa: Pomodoro, Mozzarella fresca, Scamorza affumicata, Cipolla rossa di Tropea e Crudo San Daniele DOP.",
    "price": 12,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-2025.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "2026",
    "description": "Speciale della casa: Pomodoro, Mozzarella fresca, Scamorza affumicata, Peperoni grigliati e Salsiccia fresca nostrana.",
    "price": 12,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-2026.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "2027",
    "description": "Speciale della casa: Pomodoro, Mozzarella fresca, Radicchio trevigiano, Trancetti di Tonno e Ricotta affumicata a scaglie.",
    "price": 13,
    "category": "pizze",
    "subcategory": "speciali",
    "allergens": [
      "pesce",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      1,
      4,
      6
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-2027.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Montecarlo",
    "description": "Pizza bianca: Mozzarella fresca Caseificio Comalat, Funghi Porcini trifolati, Formaggio Brie e Prosciutto Crudo San Daniele DOP 36 mesi.",
    "price": 14.5,
    "category": "pizze",
    "subcategory": "bianche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-montecarlo.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Odissea",
    "description": "Pizza bianca: Mozzarella fresca Caseificio Comalat, Mazzancolle fresche e Zucchine grigliate.",
    "price": 13,
    "category": "pizze",
    "subcategory": "bianche",
    "allergens": [
      "crostacei",
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      2,
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-odissea.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Bianca",
    "description": "Pizza bianca: Mozzarella Caseificio Comalat, Gorgonzola DOP, Speck affumicato dell'Alto Adige e Noci tostate.",
    "price": 13,
    "category": "pizze",
    "subcategory": "bianche",
    "allergens": [
      "glutine",
      "latte",
      "frutta_a_guscio"
    ],
    "allergenNumbers": [
      4,
      6,
      10
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-bianca.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Sara",
    "description": "Pizza bianca: Mozzarella Caseificio Comalat, Stracchino cremoso, Pancetta arrotolata al pepe e Rosmarino fresco.",
    "price": 11,
    "category": "pizze",
    "subcategory": "bianche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-sara.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Barbarossa",
    "description": "Pizza bianca: Mozzarella Caseificio Comalat, Gorgonzola DOP, Prosciutto cotto di Praga e riduzione di Balsamico.",
    "price": 11,
    "category": "pizze",
    "subcategory": "bianche",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-barbarossa.jpg",
    "dietary": {
      "isVegetarian": false,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Porcini",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Funghi Porcini profumati.",
    "price": 9.5,
    "category": "pizze",
    "subcategory": "verdure",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-porcini.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Verdure ai Ferri",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Melanzane, Peperoni e Zucchine fresche grigliate ai ferri.",
    "price": 13,
    "category": "pizze",
    "subcategory": "verdure",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-verdure-ferri.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Zucchine",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Zucchine fresche grigliate.",
    "price": 9,
    "category": "pizze",
    "subcategory": "verdure",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-zucchine.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Melanzane",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Melanzane fresche grigliate.",
    "price": 9,
    "category": "pizze",
    "subcategory": "verdure",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-melanzane.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Peperoni",
    "description": "Pomodoro San Marzano, Mozzarella fresca Caseificio Comalat, Peperoni freschi grigliati.",
    "price": 9,
    "category": "pizze",
    "subcategory": "verdure",
    "allergens": [
      "glutine",
      "latte"
    ],
    "allergenNumbers": [
      4,
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/dishes/pizza-peperoni.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false
    }
  },
  {
    "title": "Valdobbiadene Prosecco Superiore DOCG Brut",
    "description": "Cantina Bortoluz (Veneto) - Glera 100%, 11.50% vol. Sentori fruttati di pesca bianca, pera, mela e richiami floreali di rosa e agrumi. Asciutto e sapido, privo di spigolosità. Con antipasti, crostacei e pesce pregiato.",
    "price": 20,
    "category": "vini",
    "subcategory": "bollicine_charmat",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/prosecco-bortoluz-brut.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": "NV",
      "region": "Veneto",
      "producer": "Cantina Bortoluz",
      "bottleSize": "750ml",
      "grape": "Glera 100%",
      "alcohol": "11.50% vol.",
      "notes": "Sentori di pesca bianca, mela e rosa. Perfetto per antipasti di pesce e crostacei."
    }
  },
  {
    "title": "Valdobbiadene Prosecco Superiore DOCG Extra Dry",
    "description": "Cantina Bortoluz (Veneto) - Glera 100%, 11.50% vol. Sentori fruttati di pesca bianca, pera, mela e richiami floreali. Sapido, armonioso ed elegante. Ideale per aperitivi e piatti leggeri.",
    "price": 20,
    "category": "vini",
    "subcategory": "bollicine_charmat",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/prosecco-bortoluz-extradry.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": "NV",
      "region": "Veneto",
      "producer": "Cantina Bortoluz",
      "bottleSize": "750ml",
      "grape": "Glera 100%",
      "alcohol": "11.50% vol.",
      "notes": "Fruttato e armonico, ideale aperitivo e primi delicati."
    }
  },
  {
    "title": "'Il Veliero' Cuvée Extra Dry",
    "description": "Cantina Bonato (Veneto) - Glera, Chardonnay. Spumante della casa con sentori floreali e fruttati, gusto fresco, equilibrato e armonico. Ottimo per aperitivi, antipasti di pesce, fritture e risotti leggeri.",
    "price": 14,
    "category": "vini",
    "subcategory": "bollicine_charmat",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/cuvee-veliero.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": "NV",
      "region": "Veneto",
      "producer": "Cantina Bonato",
      "bottleSize": "750ml",
      "grape": "Glera, Chardonnay",
      "alcohol": "11.00% vol.",
      "notes": "Cuvée esclusiva Il Veliero, versatile e briosa."
    }
  },
  {
    "title": "Brut Champagne",
    "description": "Charles de Courcelle (Francia) - Chardonnay, Pinot noir, Pinot blanc, 12% vol. Aromi di brioche fragrante, frutta matura, miele e frutta secca. Ottimo come aperitivo o a tutto pasto, ideale con pesci grassi, crostacei e frutti di mare.",
    "price": 50,
    "category": "vini",
    "subcategory": "bollicine_charmat",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/wines/champagne-courcelle.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "champagne",
      "vintage": "NV",
      "region": "Champagne (Francia)",
      "producer": "Charles de Courcelle",
      "bottleSize": "750ml",
      "grape": "Chardonnay, Pinot Noir, Pinot Blanc",
      "alcohol": "12.00% vol.",
      "notes": "Perlage nobilissimo, note di panetteria e miele d'acacia."
    }
  },
  {
    "title": "'Altinum' Trento DOC Brut 2021",
    "description": "Cantina Aldeno (Trentino) - Chardonnay, Pinot nero, 12% vol. Sentori di lievito, crosta di pane e frutta a polpa bianca. Strutturato ed elegante con lungo finale minerale. Ottimo per aperitivi e a tutto pasto.",
    "price": 30,
    "category": "vini",
    "subcategory": "bollicine_metodo_classico",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/altinum-trento-brut.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": 2021,
      "region": "Trentino",
      "producer": "Cantina Aldeno",
      "bottleSize": "750ml",
      "grape": "Chardonnay, Pinot Nero",
      "alcohol": "12.00% vol.",
      "notes": "Metodo Classico d'altura, lieviti fini e freschezza alpina."
    }
  },
  {
    "title": "'Altinum' Trento DOC Pas Dosè",
    "description": "Cantina Aldeno (Trentino) - Chardonnay, Pinot nero, 12% vol. Sentori complessi di fiori di campo, miele e mandorle tostate. Palato pieno ed elegante con netto fondo minerale.",
    "price": 30,
    "category": "vini",
    "subcategory": "bollicine_metodo_classico",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/altinum-trento-pasdose.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": "NV",
      "region": "Trentino",
      "producer": "Cantina Aldeno",
      "bottleSize": "750ml",
      "grape": "Chardonnay, Pinot Nero",
      "alcohol": "12.00% vol.",
      "notes": "Dosaggio zero di grande rigore stilistico e sapidità."
    }
  },
  {
    "title": "Franciacorta DOCG Brut Millesimato 2021",
    "description": "Cantina Romantica (Lombardia) - 95% Chardonnay, 5% Pinot nero, 12.50% vol. Fresco, intenso, con note di fiori bianchi, nocciola e finale di lievito fragrante. Eccellente con crostacei e frutti di mare.",
    "price": 35,
    "category": "vini",
    "subcategory": "bollicine_metodo_classico",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/franciacorta-romantica.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": 2021,
      "region": "Lombardia (Franciacorta)",
      "producer": "Cantina Romantica",
      "bottleSize": "750ml",
      "grape": "95% Chardonnay, 5% Pinot Nero",
      "alcohol": "12.50% vol.",
      "notes": "Millesimato elegante e setoso, compagno ideale di crudi e scampi."
    }
  },
  {
    "title": "'Freccianera' Saten Millesimato 2021",
    "description": "Cantina Freccianera (Lombardia) - 100% Chardonnay, 12.50% vol. Profumi freschi agrumati e sfumature di vaniglia. Fragrante e sapido con bollicina morbidissima e cremosa.",
    "price": 36,
    "category": "vini",
    "subcategory": "bollicine_metodo_classico",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/freccianera-saten.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": 2021,
      "region": "Lombardia (Franciacorta)",
      "producer": "Cantina Freccianera",
      "bottleSize": "750ml",
      "grape": "100% Chardonnay",
      "alcohol": "12.50% vol.",
      "notes": "Satèn avvolgente dalla spuma vellutata e fine."
    }
  },
  {
    "title": "'Freccianera' Nature Millesimato 2021",
    "description": "Cantina Freccianera (Lombardia) - Chardonnay, Pinot nero, 12.50% vol. Straordinaria eleganza e vigore gustativo con netta nota minerale. Abbinamento perfetto con ostriche nostrane e crudi di mare.",
    "price": 40,
    "category": "vini",
    "subcategory": "bollicine_metodo_classico",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/wines/freccianera-nature.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": 2021,
      "region": "Lombardia (Franciacorta)",
      "producer": "Cantina Freccianera",
      "bottleSize": "750ml",
      "grape": "Chardonnay, Pinot Nero",
      "alcohol": "12.50% vol.",
      "notes": "Non dosato purissimo, esalta ostriche e tartare."
    }
  },
  {
    "title": "'Sessanta' DOCG Dosaggio Zero",
    "description": "Cantina Luca Bellani (Lombardia) - Pinot nero 100%, 12.50% vol. Frutta matura con finale citrino, bocca cremosa e ampia, finale sapido e minerale. Perfetto con molluschi, crostacei e crudo.",
    "price": 40,
    "category": "vini",
    "subcategory": "bollicine_metodo_classico",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/wines/sessanta-bellani.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bollicine",
      "vintage": "NV",
      "region": "Lombardia (Oltrepò Pavese)",
      "producer": "Cantina Luca Bellani",
      "bottleSize": "750ml",
      "grape": "100% Pinot Nero",
      "alcohol": "12.50% vol.",
      "notes": "Oltre 60 mesi sui lieviti, complessità monumentale."
    }
  },
  {
    "title": "Lugana DOC",
    "description": "Cantina Bennati - Tenuta Soraighe (Veneto) - Trebbiano di Lugana 100%, 12.50% vol. Note di frutta tropicale, agrumi e salvia. Ottima struttura e spiccata mineralità. Ideale per primi di pesce e carni bianche.",
    "price": 20,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/lugana-soraighe.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Veneto (Lago di Garda)",
      "producer": "Tenuta Soraighe - Bennati",
      "bottleSize": "750ml",
      "grape": "Trebbiano di Lugana 100%",
      "alcohol": "12.50% vol.",
      "notes": "Armonico, fresco, perfetto con branzino e risotti."
    }
  },
  {
    "title": "Custoza DOC",
    "description": "Cantina Monte Zovo (Veneto) - 40% Garganega, 30% Trebbianello, 30% Chardonnay, 12.50% vol. Frutta fresca (pera, mela verde) e note floreali. Medio corpo con finale gradevolmente amarognolo di mandorla.",
    "price": 14,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/custoza-montezovo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Veneto",
      "producer": "Cantina Monte Zovo",
      "bottleSize": "750ml",
      "grape": "Garganega, Trebbianello, Chardonnay",
      "alcohol": "12.50% vol.",
      "notes": "Delicato e floreale, ottimo con antipasti e formaggi freschi."
    }
  },
  {
    "title": "Soave DOC",
    "description": "Cantina Monte Zovo (Veneto) - 70% Garganega, 30% Trebbiano di Soave, 12.50% vol. Profumo floreale con note di pesca bianca, albicocca e finezza minerale vulcanica. Ideale con pesce crudo e crostacei.",
    "price": 14,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/soave-montezovo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Veneto (Soave)",
      "producer": "Cantina Monte Zovo",
      "bottleSize": "750ml",
      "grape": "70% Garganega, 30% Trebbiano di Soave",
      "alcohol": "12.50% vol.",
      "notes": "Fresco e minerale, accompagna crudi e primi di pesce."
    }
  },
  {
    "title": "Pinot Grigio delle Venezie DOC",
    "description": "Cantina Monte Zovo (Veneto) - 100% Pinot Grigio, 12.50% vol. Profumi di frutta fresca e fiori gialli di campo. Fresco, vivace e beverino al palato.",
    "price": 14,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/pinot-grigio-montezovo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Veneto",
      "producer": "Cantina Monte Zovo",
      "bottleSize": "750ml",
      "grape": "100% Pinot Grigio",
      "alcohol": "12.50% vol.",
      "notes": "Equilibrato e piacevole, ideale per aperitivi."
    }
  },
  {
    "title": "Gewürztraminer DOC",
    "description": "Cantina Aldeno (Trentino Alto Adige) - 100% Gewürztraminer, 13% vol. Esplosione aromatica con sentori di petali di rosa, chiodi di garofano, litchi e melone. Palato pieno, morbido e persistente.",
    "price": 22,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/gewurztraminer-aldeno.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Trentino Alto Adige",
      "producer": "Cantina Aldeno",
      "bottleSize": "750ml",
      "grape": "100% Gewürztraminer",
      "alcohol": "13.00% vol.",
      "notes": "Aromatico per eccellenza, ottimo con crostacei e formaggi."
    }
  },
  {
    "title": "Müller Thurgau DOC",
    "description": "Cantina Aldeno (Trentino Alto Adige) - 100% Müller Thurgau, 12.50% vol. Note di salvia, rosmarino, cedro e pesca bianca. Secco, sapido e gradevolmente persistente. Con risotti e frutti di mare.",
    "price": 20,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/muller-thurgau-aldeno.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Trentino Alto Adige",
      "producer": "Cantina Aldeno",
      "bottleSize": "750ml",
      "grape": "100% Müller Thurgau",
      "alcohol": "12.50% vol.",
      "notes": "Note alpine aromatiche e grande sapidità."
    }
  },
  {
    "title": "'Ca Brusade' Chardonnay 2023",
    "description": "Freccianera (Lombardia) - Chardonnay 100%, 12.50% vol. Bouquet delicato con mela golden, fondo salato e fresca mineralità. Ottimo con risotti di mare e salmone al forno.",
    "price": 18,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/ca-brusade-chardonnay.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Lombardia",
      "producer": "Freccianera",
      "bottleSize": "750ml",
      "grape": "100% Chardonnay",
      "alcohol": "12.50% vol.",
      "notes": "Vino bianco fermo elegante e minerale."
    }
  },
  {
    "title": "'Emilio Primo' IGT Toscana Bianco",
    "description": "Terre del Marchesato - Fuselli (Toscana / Bolgheri) - Vermentino 100%, 13% vol. Fiori d'acacia, sambuco, pesca bianca, nocciola e mandorla dolce. Ottimo con crudi e pescato al forno.",
    "price": 25,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/emilio-primo-toscana.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Toscana (Bolgheri)",
      "producer": "Terre del Marchesato - Fuselli",
      "bottleSize": "750ml",
      "grape": "100% Vermentino",
      "alcohol": "13.00% vol.",
      "notes": "Espressione mediterranea di Bolgheri ricca e solare."
    }
  },
  {
    "title": "'PAPEO' 2023 IGT",
    "description": "Terre del Marchesato - Fuselli (Toscana / Bolgheri) - Vermentino in purezza, 14% vol. Note di gelsomino, nespola, pasticceria, miele e chiodi di garofano. Corpo caldo e sapido, magnifico anche con la carbonara.",
    "price": 25,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/wines/papeo-toscana.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Toscana (Bolgheri)",
      "producer": "Terre del Marchesato - Fuselli",
      "bottleSize": "750ml",
      "grape": "100% Vermentino",
      "alcohol": "14.00% vol.",
      "notes": "Grande Vermentino strutturato, affinato sui lieviti."
    }
  },
  {
    "title": "Ribolla Gialla I.G.P. Venezia Giulia",
    "description": "Cantina Reguta (Friuli Venezia Giulia) - Ribolla Gialla 100%, 13% vol. Fiori di campo, erbe aromatiche e pompelmo. Fine acidità ed elegante freschezza. Con antipasti di mare e minestre.",
    "price": 22,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/ribolla-gialla-reguta.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Friuli Venezia Giulia",
      "producer": "Cantina Reguta",
      "bottleSize": "750ml",
      "grape": "100% Ribolla Gialla",
      "alcohol": "13.00% vol.",
      "notes": "Autentico classico friulano, vibrante ed elegante."
    }
  },
  {
    "title": "Sauvignon I.G.P. Trevenezie",
    "description": "Cantina Reguta (Friuli Venezia Giulia) - Sauvignon 100%, 13% vol. Tipici sentori di peperone verde, foglia di pomodoro, bosso e salvia. Asciutto con lunga nota minerale. Con frutti di mare e crostacei.",
    "price": 22,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/sauvignon-reguta.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Friuli Venezia Giulia",
      "producer": "Cantina Reguta",
      "bottleSize": "750ml",
      "grape": "100% Sauvignon",
      "alcohol": "13.00% vol.",
      "notes": "Profumi varietali intensi e beva fresca."
    }
  },
  {
    "title": "'Renadoro' Vermentino di Gallura DOCG",
    "description": "Cantina Zanatta (Sardegna) - Vermentino 100%, 13% vol. Equilibrato, strutturato, riflessi verdognoli e tipicità sarda inconfondibile. Ideale per crudo di mare e pescato alla griglia.",
    "price": 26,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/renadoro-vermentino.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Sardegna (Gallura)",
      "producer": "Cantina Zanatta",
      "bottleSize": "750ml",
      "grape": "100% Vermentino",
      "alcohol": "13.00% vol.",
      "notes": "Mineralità granitica gallurese e macchia mediterranea."
    }
  },
  {
    "title": "Grillo Sicilia DOC",
    "description": "Cantina Nino Gandolfo (Sicilia) - Grillo 100%, 13% vol. Ricco bouquet tropicale con note di zagara, agrume e macchia marina. Fresco, secco con lungo finale aromatico. Perfetto con antipasti di mare e crudi.",
    "price": 22,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/grillo-gandolfo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Sicilia",
      "producer": "Cantina Nino Gandolfo",
      "bottleSize": "750ml",
      "grape": "100% Grillo",
      "alcohol": "13.00% vol.",
      "notes": "Sole di Sicilia, note agrumate e salmastre."
    }
  },
  {
    "title": "'Alice' Salento I.G.T. Verdeca",
    "description": "Produttori di Manduria (Puglia) - Verdeca 100%, 13% vol. Biancospino, fiori d'acacia, cedro, pompelmo giallo e note saline. Fresco e sapido, ideale con pesce al forno e carpacci magri.",
    "price": 20,
    "category": "vini",
    "subcategory": "bianchi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/alice-verdeca.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "bianco",
      "vintage": 2023,
      "region": "Puglia (Salento)",
      "producer": "Produttori di Manduria",
      "bottleSize": "750ml",
      "grape": "100% Verdeca",
      "alcohol": "13.00% vol.",
      "notes": "Fresco e agrumato con note iodate del mar Ionio."
    }
  },
  {
    "title": "'Bragetti' 2018",
    "description": "Cantina Col Dovigo (Veneto - Breganze) - Merlot in purezza, 13.50% vol. Profumi di amarena matura, rosa appassita, vaniglia dolce e spezie. Strutturato con tannini decisi ed evoluti. Ottimo per carni rosse e spiedo.",
    "price": 30,
    "category": "vini",
    "subcategory": "rossi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/wines/bragetti-coldovigo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "rosso",
      "vintage": 2018,
      "region": "Veneto (Breganze)",
      "producer": "Cantina Col Dovigo",
      "bottleSize": "750ml",
      "grape": "100% Merlot",
      "alcohol": "13.50% vol.",
      "notes": "Rosso prestigioso vicentino, affinato con grande eleganza."
    }
  },
  {
    "title": "Valpolicella DOC",
    "description": "Cantina Monte Zovo (Veneto) - Corvina, Corvinone, Rondinella, 13% vol. Sentori di ciliegie nere, marasca, mandorle e frutta matura. Corpo pieno e tannini rotondi. Ottimo con carni alla griglia e salumi.",
    "price": 18,
    "category": "vini",
    "subcategory": "rossi",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/valpolicella-montezovo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "rosso",
      "vintage": 2022,
      "region": "Veneto (Valpolicella)",
      "producer": "Cantina Monte Zovo",
      "bottleSize": "750ml",
      "grape": "Corvina, Corvinone, Rondinella",
      "alcohol": "13.00% vol.",
      "notes": "Rosso classico veronese, fresco e fruttato."
    }
  },
  {
    "title": "'Aka' Salento I.G.T. Primitivo Rosato",
    "description": "Produttori di Manduria (Puglia) - Primitivo 100%, 13% vol. Colore rosa corallo, profumi di ciliegie fresche, melagrana, fragoline di bosco e lampone. Ideale con fritture di pesce e spaghetti alle vongole.",
    "price": 22,
    "category": "vini",
    "subcategory": "rosati",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/aka-rosato.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "rosato",
      "vintage": 2023,
      "region": "Puglia (Salento)",
      "producer": "Produttori di Manduria",
      "bottleSize": "750ml",
      "grape": "100% Primitivo",
      "alcohol": "13.00% vol.",
      "notes": "Rosato premiato dal colore intenso e frutto irresistibile."
    }
  },
  {
    "title": "Rosato Frizzante",
    "description": "Cantina Bonato (Veneto) - Pinot nero, Cabernet. Spumante rosato dal colore rosa brillante, profumo di piccoli frutti rossi, gusto vivace e leggero. Ideale per aperitivi, antipasti e tartare di pesce.",
    "price": 15,
    "category": "vini",
    "subcategory": "rosati",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/wines/rosato-bonato.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    },
    "wineDetails": {
      "type": "rosato",
      "vintage": "NV",
      "region": "Veneto",
      "producer": "Cantina Bonato",
      "bottleSize": "750ml",
      "grape": "Pinot Nero, Cabernet",
      "alcohol": "11.50% vol.",
      "notes": "Fresco e brioso, perfetto compagno di aperitivi."
    }
  },
  {
    "title": "Espresso",
    "description": "Caffè espresso classico selezionato.",
    "price": 1.3,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/espresso.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Caffè Macchiato",
    "description": "Caffè espresso con morbida goccia di latte caldo o freddo.",
    "price": 1.4,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/caffe-macchiato.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Caffè Corretto",
    "description": "Caffè espresso corretto con grappa locale di Bassano o liquore a scelta.",
    "price": 1.9,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/caffe-corretto.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Cappuccino",
    "description": "Cappuccino all'italiana con vellutata crema di latte intero montata a regola d'arte.",
    "price": 2,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/cappuccino.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Macchiatone",
    "description": "Macchiatone caldo in tazza media con crema di latte soffice.",
    "price": 1.8,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/macchiatone.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Decaffeinato",
    "description": "Caffè decaffeinato dall'aroma pieno e rotondo.",
    "price": 1.4,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/decaffeinato.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Caffè d'Orzo",
    "description": "Bevanda calda naturale d'orzo tostato in tazza piccola o grande.",
    "price": 1.4,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/orzo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Ginseng",
    "description": "Caffè aromatizzato alla radice di ginseng dolce ed energizzante.",
    "price": 1.5,
    "category": "bevande",
    "subcategory": "caffetteria",
    "allergens": [
      "latte"
    ],
    "allergenNumbers": [
      6
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/ginseng.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": true
    }
  },
  {
    "title": "Acqua Levico 75cl",
    "description": "Acqua minerale purissima Levico delle Alpi trentine in bottiglia di vetro da 75cl (Naturale o Frizzante).",
    "price": 2.5,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/acqua-levico.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Coca Lattina",
    "description": "Coca-Cola classica o Zero in lattina 33cl servita con ghiaccio e limone.",
    "price": 3,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/coca-cola.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Lemonsoda Lattina",
    "description": "Lemonsoda originale con polpa di limoni italiani in lattina 33cl.",
    "price": 3,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/lemonsoda.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Fanta Lattina",
    "description": "Fanta all'arancia in lattina 33cl con succo d'arance.",
    "price": 3,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/fanta.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "The Pesca / Limone",
    "description": "Thè freddo rinfrescante in lattina 33cl al gusto Pesca o Limone.",
    "price": 3,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/the-pesca-limone.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Birra Beck's 0.20L",
    "description": "Birra chiara Beck's alla spina piccola (0.20L).",
    "price": 3,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/becks-spina-piccola.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Birra Beck's 0.40L",
    "description": "Birra chiara Beck's alla spina media (0.40L).",
    "price": 6,
    "category": "bevande",
    "subcategory": "bibite",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/becks-spina-media.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Leffe Rossa",
    "description": "Birra belga d'abbazia rossa dal colore ambrato caldo e note speziate e caramellate (0.33L).",
    "price": 4,
    "category": "bevande",
    "subcategory": "birre",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/leffe-rossa.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Valdesteiner Rossa",
    "description": "Birra artigianale rossa corposa e maltata in bottiglia da 0.50L.",
    "price": 7,
    "category": "bevande",
    "subcategory": "birre",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/valdesteiner-rossa.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Valdesteiner Keller",
    "description": "Birra bionda artigianale non filtrata di cantina (Kellerbier) fresca e luppolata in bottiglia da 0.50L.",
    "price": 7,
    "category": "bevande",
    "subcategory": "birre",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/valdesteiner-keller.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Schinner Edel-Weisse",
    "description": "Autentica birra di frumento Weisse bavarese, torbida e profumata di banana e chiodi di garofano in bottiglia da 0.50L.",
    "price": 7,
    "category": "bevande",
    "subcategory": "birre",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/schinner-weisse.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Leffe Ambrata",
    "description": "Birra d'abbazia ambrata d'eccellenza in grande bottiglia da 0.75L con tappo a fungo.",
    "price": 9,
    "category": "bevande",
    "subcategory": "birre",
    "allergens": [
      "glutine"
    ],
    "allergenNumbers": [
      4
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/leffe-ambrata-75.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": false
    }
  },
  {
    "title": "Chardonnay / Cabernet alla spina 1/4L",
    "description": "Caraffa da 0.25L di vino della casa alla spina (Chardonnay bianco fermo o Cabernet rosso).",
    "price": 3,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/vino-spina-quarto.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Chardonnay / Cabernet alla spina 1/2L",
    "description": "Caraffa da 0.50L di vino della casa alla spina (Chardonnay bianco fermo o Cabernet rosso).",
    "price": 5,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/vino-spina-mezzo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Chardonnay / Cabernet alla spina 1L",
    "description": "Caraffa intera da 1.00L di vino della casa alla spina (Chardonnay bianco fermo o Cabernet rosso).",
    "price": 10,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/vino-spina-litro.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Cuvée Extra Dry alla spina 1/4L",
    "description": "Caraffa da 0.25L di spumante frizzante Cuvée Extra Dry alla spina.",
    "price": 4.5,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/cuvee-spina-quarto.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Cuvée Extra Dry alla spina 1/2L",
    "description": "Caraffa da 0.50L di spumante frizzante Cuvée Extra Dry alla spina.",
    "price": 9,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/cuvee-spina-mezzo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Glera alla spina 1/4L",
    "description": "Caraffa da 0.25L di vino bianco frizzante Glera veneto alla spina.",
    "price": 3,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/glera-spina-quarto.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Glera alla spina 1/2L",
    "description": "Caraffa da 0.50L di vino bianco frizzante Glera veneto alla spina.",
    "price": 6,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/glera-spina-mezzo.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Glera alla spina 1L",
    "description": "Caraffa da 1.00L di vino bianco frizzante Glera veneto alla spina.",
    "price": 12,
    "category": "bevande",
    "subcategory": "vino_sfuso",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/glera-spina-litro.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Braulio",
    "description": "Amaro alpino valtellinese all'infuso di 13 erbe, radici e bacche montane invecchiato in botti di rovere.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/braulio.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Averna",
    "description": "Storico amaro siciliano dolceamaro infuso con scorze d'arance amare e olii essenziali di limone.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/averna.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Unicum",
    "description": "Amaro digestivo ungherese a base di oltre 40 erbe medicinali dal caratteristico sapore intenso e speziato.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/unicum.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Montenegro",
    "description": "Amaro aromatico bolognese con 40 botaniche selezionate, equilibrato e profumato.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/montenegro.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Fernet",
    "description": "Fernet-Branca originale, celebre amaro bitter dalle spiccate proprietà digestive a base di 27 erbe.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/fernet.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Brancamenta",
    "description": "Liquore digestivo alle erbe arricchito con prezioso olio essenziale di menta piperita piemontese.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/brancamenta.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Lucano",
    "description": "Amaro Lucano tradizionale da antica ricetta di Pisticci con oltre 30 erbe officinali.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/lucano.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Sambuca Molinari",
    "description": "Sambuca extra pura all'anice stellato, servita liscia con chicco di caffè o ghiacciata.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/sambuca.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Prugna Ciemme",
    "description": "Liquore tradizionale del Triveneto alla prugna con distillato di susine.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/prugna-ciemme.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Vecchia Romagna",
    "description": "Brandy italiano etichetta nera distillato da uve Trebbiano e invecchiato in botti di rovere.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/vecchia-romagna.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Stravecchio",
    "description": "Stravecchio Branca, storico distillato di vino invecchiato con botte madre ultracentenaria.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/stravecchio.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grand Marnier",
    "description": "Celebre liquore francese all'arancia amara Citrus Bigaradia e pregiato cognac invecchiato.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [
      "anidride_solforosa"
    ],
    "allergenNumbers": [
      12
    ],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/grand-marnier.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "S.Marzano",
    "description": "Elisir San Marzano Borsci, liquore aromatico pugliese dal gusto vellutato e speziato.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/san-marzano.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Liquirizia",
    "description": "Liquore artigianale denso e nero all'estratto puro di radice di liquirizia di Calabria.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/liquirizia.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Limoncello",
    "description": "Limoncello tradizionale servito ghiacciato, preparato con scorze di limoni della Costiera.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/limoncello.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Nardini",
    "description": "La leggendaria Grappa Bianca di Bassano del Grappa della storica distilleria Nardini (dal 1779 al Ponte Vecchio).",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/beverages/grappa-nardini-bianca.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Nardini Riserva",
    "description": "Grappa Nardini Riserva invecchiata in botti di rovere di Slavonia, dal colore ambrato e note tostate di vaniglia.",
    "price": 4.5,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/beverages/grappa-nardini-riserva.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Nardini Tagliatella",
    "description": "Lo storico liquore tipico di Bassano ottenuto dall'unione di grappa, acquavite di marasca, arancio ed erbe amaricanti.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/beverages/grappa-tagliatella.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Sarpa Poli",
    "description": "Grappa giovane delle celebri Distillerie Poli di Schiavon (Bassano), distillata a vapore da vinacce di Merlot e Cabernet.",
    "price": 4,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/grappa-sarpa-poli.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Sarpa Oro Poli",
    "description": "Grappa Poli barricata in piccole carati di rovere francese, morbida con profumi di vaniglia e legno dolce.",
    "price": 4.5,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/grappa-sarpa-oro.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Prime Uve",
    "description": "Acquavite d'uva pregiata Bonaventura Maschio distillata da uve bianche aromatiche a bassa temperatura.",
    "price": 4.5,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": false,
    "isAvailable": true,
    "image": "/uploads/beverages/prime-uve.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  },
  {
    "title": "Grappa Storica Nera",
    "description": "Prestigiosa Grappa Storica Nera Domenis 1898, distillata a vapore con metodo discontinuo da vinacce fresche friulane a 50°.",
    "price": 5.5,
    "category": "bevande",
    "subcategory": "amari_grappe",
    "allergens": [],
    "allergenNumbers": [],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/beverages/storica-nera.jpg",
    "dietary": {
      "isVegetarian": true,
      "isVegan": true,
      "isGlutenFree": true
    }
  }
];

    const insertedMenu = await MenuItem.insertMany(menuItems);
    console.log(`  ✓ Inserted ${insertedMenu.length} dishes into the menu.`);

    // 6. Seed Daily Fresh Catch (Pescato del Giorno)
    console.log('[Seed] Seeding daily fresh market catch...');
    const pescatoItems = [
      {
        title: 'Orata Selvaggia dell\'Adriatico Pescata all\'Amo',
        description: 'Magnifico esemplare da 1.2 kg pescato al largo di Chioggia all\'alba. Polpa soda e candida, perfetta per cottura al sale o al forno con patate.',
        image: '/uploads/pescato/orata-selvaggia.jpg',
        price: 36.0,
        catchDate: new Date(),
        isAvailable: true,
        marketLocation: 'Mercato Ittico di Chioggia',
        kilogramsAvailable: 3.5,
      },
      {
        title: 'Scampi Nostrani Vivi di Chioggia',
        description: 'Scampi freschissimi appena sbarcati dal peschereccio San Marco. Dolcezza straordinaria per crudo o scottata rapida.',
        image: '/uploads/pescato/scampi-vivi.jpg',
        price: 45.0,
        catchDate: new Date(),
        isAvailable: true,
        marketLocation: 'Mercato Ittico di Chioggia',
        kilogramsAvailable: 5.0,
      },
      {
        title: 'Calamari Nostrani di Paranza',
        description: 'Calamari teneri di media pezzatura, ideali per la griglia o una frittura dorata e leggera.',
        image: '/uploads/pescato/calamari-paranza.jpg',
        price: 24.0,
        catchDate: new Date(),
        isAvailable: true,
        marketLocation: 'Mercato Ittico di Chioggia',
        kilogramsAvailable: 8.0,
      },
    ];
    await Pescato.insertMany(pescatoItems);
    console.log(`  ✓ Inserted ${pescatoItems.length} fresh catch items.`);

    // 7. Seed Dynamic Notices / Banners (Avvisi)
    console.log('[Seed] Seeding announcement and notice banners...');
    const avvisiItems = [
      {
        title: 'Apertura Straordinaria di Ferragosto',
        message: 'Il 15 Agosto saremo aperti con orario continuato sia a pranzo che a cena con il nostro Gran Menù Degustazione Marinaro. Vi aspettiamo!',
        severity: 'info',
        startDate: new Date(Date.now() - 86400000), // yesterday
        endDate: new Date(Date.now() + 86400000 * 20), // 20 days ahead
        isActive: true,
      },
      {
        title: 'Consiglio Prenotazione per il Fine Settimana',
        message: 'A causa dell\'elevata affluenza nei giorni di venerdì sera, sabato e domenica, invitiamo i gentili clienti a prenotare il proprio tavolo con almeno 24 ore di anticipo.',
        severity: 'warning',
        startDate: new Date(Date.now() - 86400000 * 2),
        isActive: true,
      },
    ];
    await Avviso.insertMany(avvisiItems);
    console.log(`  ✓ Inserted ${avvisiItems.length} notice banners.`);

    // 8. Seed Upcoming Events (Eventi)
    console.log('[Seed] Seeding upcoming culinary events...');
    const eventiItems = [
      {
        title: 'Gran Galà del Pescato Adriatico & Bollicine di Valdobbiadene',
        description: 'Un viaggio gastronomico in 5 portate studiato dal nostro chef, abbinato a millesimati rari di Prosecco Superiore DOCG e Franciacorta. Con la partecipazione del sommelier della cantina.',
        image: '/uploads/eventi/gala-bollicine.jpg',
        eventDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
        price: 85.0,
        maxSeats: 45,
        reservedSeats: 18,
        isActive: true,
      },
      {
        title: 'Serata Crudi & Jazz sotto le Stelle',
        description: 'Degustazione esclusiva di ostriche, tartare e crostacei freschi sulla nostra terrazza panoramica con l\'accompagnamento musicale del quartetto jazz "Laguna Blue".',
        image: '/uploads/eventi/crudi-jazz.jpg',
        eventDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
        price: 65.0,
        maxSeats: 50,
        reservedSeats: 26,
        isActive: true,
      },
    ];
    await Evento.insertMany(eventiItems);
    console.log(`  ✓ Inserted ${eventiItems.length} upcoming culinary events.`);

    // 9. Record System Audit Log for Initial Seed
    await AuditLog.create({
      user: masterAdmin1._id,
      userEmail: masterAdmin1.email,
      operator: masterAdmin1.email,
      role: 'admin',
      action: 'SYSTEM_SEED',
      resource: 'SYSTEM',
      ipAddress: '127.0.0.1',
      userAgent: 'SeedScript/1.0',
      details: {
        usersCount: 5,
        menuItemsCount: insertedMenu.length,
        pescatoCount: pescatoItems.length,
        avvisiCount: avvisiItems.length,
        eventiCount: eventiItems.length,
      },
      status: 'SUCCESS',
    });
    console.log('  ✓ System seed audit log entry recorded.');

    console.log('⚓ Il Veliero Database Seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    throw error;
  }
}

/**
 * Automatically runs seeding only if the database is currently empty (0 menu items)
 */
export async function seedIfEmpty(): Promise<void> {
  try {
    const count = await MenuItem.countDocuments();
    if (count === 0) {
      console.log('[Seed] Database is empty. Running automatic seed...');
      await seedDatabase();
    } else {
      console.log(`[Seed] Database already contains ${count} menu items. Skipping auto-seed.`);
    }
  } catch (error) {
    console.warn('[Seed] Warning during seedIfEmpty check:', error);
  }
}

// Execute directly if run as CLI script
if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await disconnectDatabase();
      process.exit(1);
    });
}

export default seedDatabase;
