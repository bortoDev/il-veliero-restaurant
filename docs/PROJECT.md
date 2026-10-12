# Project: Il Veliero Menu Digitalization & Dishoom Presentation

## Architecture
- **Monorepo / Full Stack Layout**:
  - `backend/`: Node.js, Express, TypeScript, Mongoose/MongoDB.
    - `src/models/MenuItem.ts`: Mongoose schema, validation enums (`MENU_CATEGORIES = ['pesce', 'carne', 'contorni', 'pizze', 'vini', 'bevande', 'insalatone', 'piatti_estivi']`), `allergenNumbers` (1–14), `OFFICIAL_ALLERGEN_MAP`.
    - `src/seed/seed.ts`: Seed script populating the complete 196-item authentic menu from 29 photo assets.
    - `src/controllers/menu.controller.ts`: REST API controller for menu queries, category filtering, allergen exclusions, full text search.
    - `src/routes/menu.routes.ts`: Menu API routes.
  - `frontend/`: Angular 17+ standalone components, Tailwind CSS + custom Dishoom vintage luxury theme.
    - `src/app/core/models/index.ts`: TypeScript interfaces (`MenuItem`, `MenuCategory`, `AllergenInfo`).
    - `src/app/shared/components/allergen-badge/`: Official 1–14 numbered allergen badges (`[1] Pesce`, `[4] Glutine`, etc.).
    - `src/app/features/public/menu/`: Dishoom public menu view, 8 navigation tabs, subcategory filters (Finferli at top, Vini & Bevande sub-filters), dot-leader dish cards, handwritten blackboard specials (`weeklySeafood`), instant search & allergen exclusion filter.
    - `src/app/features/public/qr-menu/`: Mobile QR menu view.
    - `src/app/features/gestore/menu-management/`: Admin menu management view.
  - `materiale_utile/menu/`: 29 authoritative photo assets documenting the full real restaurant menu and official 1–14 allergen table.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Real Menu Inventory | 196 cataloged authentic items (Pesce 29, Carne 9, Piatti Estivi 3, Contorni 6, Insalatone 6, Pizze 65, Vini 28, Bevande/Bar 50) | M1 | Survey & M1 (DONE) |
| 2 | Official 1–14 Allergen Mapping | Tabella Allergeni: 1:Pesce, 2:Crostacei, 3:Molluschi, 4:Glutine, 5:Uova, 6:Latte, 7:Sedano, 8:Senape, 9:Sesamo, 10:Frutta a guscio, 11:Arachidi, 12:Solfiti, 13:Lupini, 14:Soia | M1 | Survey & M1 (DONE) |
| 3 | Backend Model Expansion | `MenuItem.ts` supporting 8 categories, `allergenNumbers: [Number]`, `OFFICIAL_ALLERGEN_MAP`, 22+ subcategories | M1 | M1 (DONE) |
| 4 | Seed Script Overhaul & Ingestion | `seed.ts` populating all 196 real items, clearing 28 fake items, 30/30 integration tests passing, live MongoDB seeded | M1 | M1 (DONE) |
| 5 | Frontend Model & Allergen Badge Update | `models/index.ts` category union update, `allergen-badge.component.ts` official 1–14 numbered badges | M2 | IN_PROGRESS |
| 6 | Frontend Dishoom Public Menu View | `menu.component.ts/html/scss` with 8 tabs, Finferli season first in Pizze, Insalatone section, Vini & Bevande sub-filters, real blackboard seafood specials, dot leaders, search/allergen filters | M2 | IN_PROGRESS |
| 7 | QR-Menu & Admin Menu Sync | Synchronize category lists and models in `qr-menu.component.ts` and `menu-management.component.ts` | M2 | IN_PROGRESS |
| 8 | Full Stack E2E & Production Build | Docker execution (`docker compose build frontend`), MongoDB inspection, live API verification, zero TypeScript errors | M3 | PLANNED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Backend Model & Seed Script Overhaul | Update `MenuItem.ts`, `seed.ts` (196 real items), `seed-idempotency.test.ts`, execute seed in Docker `ilveliero-backend`, verify MongoDB and API | none | DONE |
| 2 | Frontend Models, Allergen 1–14 Badges & Public Menu Component | Update `models/index.ts`, `allergen-badge.component.ts`, `menu.component.ts/html/scss`, `qr-menu`, `menu-management` | M1 | IN_PROGRESS |
| 3 | E2E Integration, Docker Production Build & Quality Gate | Live API check, complete frontend build (`docker compose build frontend`), category & allergen filtering verification | M1, M2 | PLANNED |

## Interface Contracts
### Backend ↔ Frontend API Contract
- **Endpoint**: `GET /api/v1/menu`
- **Supported Query Params**:
  - `category`: string (e.g. `'pesce'`, `'pizze'`, `'insalatone'`, `'piatti_estivi'`, `'vini'`, `'bevande'`, `'carne'`, `'contorni'`)
  - `subcategory`: string (optional filter)
  - `excludeAllergens`: comma-separated string or numbers (e.g. `excludeAllergens=4` or `excludeAllergens=glutine`)
  - `search`: string
- **MenuItem JSON Structure**:
  ```json
  {
    "_id": "string",
    "name": "string",
    "category": "pesce | carne | contorni | pizze | vini | bevande | insalatone | piatti_estivi",
    "subcategory": "string",
    "price": 14.50,
    "description": "string",
    "allergens": ["pesce", "glutine"],
    "allergenNumbers": [1, 4],
    "isChefSpecial": true,
    "isAvailable": true,
    "image": "/uploads/dishes/...",
    "dietary": { "isVegetarian": false, "isVegan": false, "isGlutenFree": false },
    "wineDetails": { "type": "bianco", "vintage": 2023, "region": "Veneto", "producer": "...", "bottleSize": "750ml" }
  }
  ```

## Code Layout
- `backend/src/models/MenuItem.ts`
- `backend/src/seed/seed.ts`
- `backend/src/controllers/menu.controller.ts`
- `backend/tests/integration/seed-idempotency.test.ts`
- `frontend/src/app/core/models/index.ts`
- `frontend/src/app/shared/components/allergen-badge/allergen-badge.component.ts`
- `frontend/src/app/shared/components/allergen-badge/allergen-badge.component.html`
- `frontend/src/app/features/public/menu/menu.component.ts`
- `frontend/src/app/features/public/menu/menu.component.html`
- `frontend/src/app/features/public/menu/menu.component.scss`
- `frontend/src/app/features/public/qr-menu/qr-menu.component.ts`
- `frontend/src/app/features/gestore/menu-management/menu-management.component.ts`
