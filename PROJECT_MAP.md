# 🗺️ Mappa del Progetto (PROJECT_MAP.md)

Mappa architetturale sintetica per l'instradamento rapido nel repository **Il Veliero**.

---

## 📁 1. Configurazione Root & Container

- **`docker-compose.yml`**: Orchestrazione multi-container (MongoDB 7.0, backend Express, frontend Angular/Nginx).
- **`backend/Dockerfile`**: Build multi-stage Node.js 20 Alpine per il backend.
- **`frontend/Dockerfile` & `frontend/nginx.conf`**: Build di produzione Angular 18 e configurazione Nginx SPA/caching.

---

## 📁 2. Backend (`backend/src`)

- **`backend/src/app.ts`**: Inizializzazione Express, middleware globali (CORS, Helmet, Rate Limit, Audit) e mount rotte `/api/v1`.
  - Export: `createApp(): Application`, `app`
- **`backend/src/server.ts`**: Bootstrap HTTP server e connessione database.
  - Export: `startServer(): Promise<void>`

### 📂 Config & Database
- **`backend/src/config/database.ts`**: Connessione Mongoose con gestione pool e graceful shutdown (`connectDB()`, `disconnectDB()`).
- **`backend/src/config/environment.ts`**: Parsing tipizzato variabili d'ambiente (`env: EnvironmentConfig`).

### 📂 Modelli Mongoose (`backend/src/models`)
*Barrel export: `backend/src/models/index.ts`*
- **`MenuItem.ts`**: Portate menù (`name`, `category`, `price`, `ingredients`, `allergens`, `winePairing`, `isAvailable`, `isSpecial`).
- **`Pescato.ts`**: Pescato del giorno (`name`, `origin`, `catchDate`, `cookingMethods[]`, `pricePerHg`, `isAvailable`, `isWeeklySpecial`).
- **`Evento.ts`**: Eventi e degustazioni (`title`, `description`, `eventDate`, `eventEndDate`, `price`, `isPublished`, `isFeatured`).
- **`Avviso.ts`**: Banner e comunicazioni (`title`, `message`, `severity: 'info'|'warning'|'danger'`, `isActive`, `priority`).
- **`InfoLocale.ts`**: Orari, contatti e storia (`address`, `contacts`, `openingHours`, `story`, `socialLinks`).
- **`User.ts`**: Utenti e credenziali bcrypt (`email`, `name`, `role: 'client'|'gestore'|'admin'`, `isActive`, `isBlocked`, `comparePassword()`).
- **`TokenBlacklist.ts`**: Revoca immediata token JWT con indice TTL (`token`, `reason`, `expiresAt`).
- **`AuditLog.ts`**: Registro immutabile azioni amministrative (`action: 'CREATE'|'UPDATE'|'DELETE'|'LOGIN'|'SECURITY'`, `resource`, `status`, `ipAddress`, `operator`).

### 📂 Controller (`backend/src/controllers`)
- **`auth.controller.ts`**: `register`, `login`, `logout`, `logoutAll`, `emergencyRecovery`, `getMe`, `changePassword`.
- **`menu.controller.ts`**: CRUD standard (`getAll`, `getById`, `create`, `update`, `delete`) + `toggleItemAvailability`.
- **`pescato.controller.ts`**: CRUD standard + `getActivePescato`.
- **`evento.controller.ts`**: CRUD standard + `getActiveEventi`.
- **`avviso.controller.ts`**: CRUD standard + `getActiveAvvisi`.
- **`info.controller.ts`**: `getInfoLocale`, `updateInfoLocale`.
- **`user.controller.ts`**: CRUD standard gestione utenti e ruoli.
- **`audit.controller.ts`**: Consultazione audit logs (`getAuditLogs`, `getAuditLogById`).
- **`blacklist.controller.ts`**: `getBlacklistedTokens`, `revokeTokenManually`, `checkTokenStatus`.
- **`upload.controller.ts`**: `uploadMedia` (validazione MIME/storage).

### 📂 Middleware (`backend/src/middleware`)
- **`auth.middleware.ts`**: Validazione JWT e blacklist check (`authenticate`, `requireAuth`).
- **`rbac.middleware.ts`**: Autorizzazione ruoli (`requireRole()`, `requireAdmin`, `requireGestore`, `requireClient`).
- **`audit.middleware.ts`**: Intercettazione automatica mutazioni e log forense (`auditMiddleware`, `extractClientIp`).
- **`rate-limit.middleware.ts`**: Limitatori di frequenza per login, emergency-recovery e API (`authLimiter`, `emergencyRecoveryLimiter`, `generalApiLimiter`).
- **`validate.middleware.ts`**: Validazione e sanitizzazione schemi Zod per body, query e params (`validateBody`, `validateQuery`).
- **`upload.middleware.ts`**: Storage Multer con whitelist MIME e limite 5MB (`upload`, `uploadSingleImage`).
- **`error.middleware.ts`**: Gestore errori HTTP centralizzato (`errorHandler`).

### 📂 Rotte, Servizi & Utility
- **`backend/src/routes/`**: Mount delle API REST su `index.ts` (`/auth`, `/menu`, `/pescato`, `/eventi`, `/avvisi`, `/info`, `/audit`, `/blacklist`, `/users`, `/upload`, `/health`).
- **`backend/src/validators/`**: Schemi Zod di validazione e sanitizzazione input (`auth`, `menu`, `pescato`, `evento`, `avviso`, `info`, `user`).
- **`backend/src/services/jwt.service.ts`**: Generazione e verifica token (`jwtService: JwtService`).
- **`backend/src/utils/errors.ts`**: Classi errore (`AppError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
- **`backend/src/seed/seed.ts`**: Seeding dati reali ristorante (`seedDatabase()`).

---

## 📁 3. Frontend (`frontend/src/app`)

> 💡 **Convenzione Componenti Angular**: Ogni voce `*.component.ts` comprende implicitamente i rispettivi file satellite `*.html` e `*.scss` presenti nella medesima cartella.

### 📂 Bootstrap & Routing
- **`frontend/src/main.ts` & `app.config.ts`**: Bootstrap standalone Angular 18 (`appConfig`).
- **`app.component.ts`**: Shell principale (`AppComponent` con navbar, notice-banner, router-outlet, footer).
- **`app.routes.ts`**: Definizione delle rotte pubbliche e protette (`routes: Routes`).

### 📂 Core Module (`frontend/src/app/core`)
- **`models/index.ts`**: Tipizzazioni TypeScript (`User`, `MenuItem`, `PescatoItem`, `Avviso`, `Evento`, `InfoLocale`, `OpeningHours`, `AuditLog`, `BlacklistedToken`).
- **`guards/`**: `authGuard` (verifica login), `roleGuard` / `gestoreGuard` / `adminGuard` (controllo permessi).
- **`interceptors/`**: `jwtInterceptor` (iniezione token Bearer), `errorInterceptor` (cattura 401 e notifiche toast).
- **`services/`**:
  - `api.service.ts`: Client HTTP generico (`get`, `post`, `put`, `patch`, `delete`).
  - `auth.service.ts`: Sessione reattiva con Signals (`currentUser`, `isAuthenticated`, `userRole`, `login()`, `logout()`).
  - `animation.service.ts`: Integrazione GSAP ScrollTrigger per espansione video e morphing veliero.
  - `menu.service.ts`, `pescato.service.ts`, `evento.service.ts`, `avviso.service.ts`, `info.service.ts`: Chiamate API di dominio.
  - `admin.service.ts`: Gestione utenti, blacklist e log di audit per admin.
  - `upload.service.ts`: Caricamento immagini multipart.

### 📂 Viste Pubbliche (`frontend/src/app/features/public`)
- **`home/home.component.ts`**: Hero video full-bleed a 4 angoli con veliero dorato GSAP e sezioni editoriali Dishoom.
- **`menu/menu.component.ts`**: Consultazione pietanze per categoria con badge allergeni e filtri.
- **`pescato/pescato.component.ts`**: Vetrina editoriale frameless del pescato fresco del giorno con gallerie fotografiche d'autore e lightbox.
- **`storia/storia.component.ts`**: Tradizione culinaria, pizza Campione del Mondo e patrimonio marittimo.
- **`eventi/eventi.component.ts`**: Bacheca eventi, degustazioni e serate speciali.
- **`dove-siamo/dove-siamo.component.ts`**: Mappa interattiva, indicazioni stradali, orari e contatti.
- **`login/login.component.ts`**: Form di autenticazione riservata per gestori e admin.
- **`qr-menu/qr-menu.component.ts`**: Versione mobile-first rapida per scansione QR al tavolo.
- **`not-found/not-found.component.ts`**: Pagina di errore 404 personalizzata a tema nautico con recupero navigazione.

### 📂 Modulo Gestore (`frontend/src/app/features/gestore`)
- **`dashboard/gestore-dashboard.component.ts`**: Cruscotto operativo e statistiche rapide.
- **`menu-management/`**, **`pescato-management/`**, **`eventi-management/`**, **`avvisi-management/`**, **`info-management/`**: Moduli CRUD operativi con toggle disponibilità immediata.

### 📂 Modulo Admin (`frontend/src/app/features/admin`)
- **`dashboard/admin-dashboard.component.ts`**: Cruscotto sicurezza e sistema.
- **`user-management/`**: Gestione account, creazione operatori e ruoli RBAC.
- **`security-hub/`**: Monitoraggio accessi, revoca massiva sessioni e recovery.
- **`audit-log-viewer/`**: Visualizzazione del registro immutabile degli audit logs.
- **`blacklist-management/`**: Gestione e revoca manuale token JWT.
- **`info-editor/`**: Configurazione testi storici ed elementi istituzionali.

### 📂 Componenti Condivisi & Icone SVG (`frontend/src/app/shared/components`)
- **`navbar/navbar.component.ts`**: Barra camaleontica fissa con rilevamento dinamico sfondo e transizioni cromatiche.
- **`footer/footer.component.ts`**: Footer con veliero dorato, recapiti, orari e link area riservata.
- **`dish-card/`**, **`notice-banner/`**, **`allergen-badge/`**, **`modal/`**, **`video-card/`**, **`nautical-decor/`**, **`palette-tester/`**: Componenti UI riutilizzabili.
- **`svg-icons/`** *(Barrel export: `svg-icons/index.ts`)*: Icone vettoriali ad alta fedeltà. Include:
  - `VelieroShipComponent` (`veliero-ship-icon.component.ts` + `veliero-ship-paths.ts`): Galeone multi-layer con canali indipendenti `primaryColor` (scafo/sartiame) e `sailColor` (vele piene).
  - `LogoScrittaIconComponent`: Logotipo corsivo *"Il Veliero"* vettoriale con allineamento ottico per navbar.
  - Altre icone tematiche: `anchor-chain`, `nautical-star`, `rosa-dei-venti`, `timone`, `wood-plaque`.

---

## 📁 4. Documentazione & Materiali Utili

- **`docs/`**: Documenti di business, requisiti (`Bozza_descrizione_utenti.pdf`, `Draft.pdf`), specifiche (`ORIGINAL_REQUEST.md`, `PROJECT.md`) e note di collaudo.
- **`materiale_utile/`**: Staging area / inbox grezza (`loghi_e_vettoriali/`, `foto_locale/`, `foto_piatti/`, `video_home/`, `video_e_clip/`, `menu_cartaceo/`, `bozze_e_documenti/`).
- **`frontend/src/assets/`**: Asset applicativi ottimizzati per il web (`images/`, `videos/`, `svg/`).

