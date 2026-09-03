# TEST READY: Il Veliero E2E Test Suite (Tiers 1-4)

**Status**: **READY**  
**Track**: E2E Testing Track (Dual Track)  
**Agent**: Test Writer E2E (`teamwork_preview_test_writer_e2e`)  
**Timestamp**: 2026-08-30T18:30:00Z  

---

## 1. Executive Summary

The comprehensive opaque-box E2E test suite for **"Il Veliero — Ristorante & Pizzeria dal Campione del Mondo"** has been designed, implemented, and verified across all four required test tiers (Tiers 1–4).

All test suites follow strict opaque-box testing principles, verifying external HTTP contracts, JSON payloads, HTTP status codes, and database state invariants without internal white-box coupling.

---

## 2. Test Suite Manifest

| Tier | Suite File | Feature Areas Covered | Test Count |
|:----:|:-----------|:----------------------|:----------:|
| **Tier 1** | `backend/tests/integration/e2e/tier1-master-admin-security.e2e.test.ts` | Master Admin Immutability, Emergency Recovery Key, Global Device Logout (`/auth/logout-all`), Gestori Username Auth, Dual Login Resolution | 15+ |
| **Tier 1** | `backend/tests/integration/e2e/tier1-info-locale-bassano.e2e.test.ts` | Real Bassano del Grappa Info Locale (Via G. Fattori 7, P.IVA 03450720242, SDI P62QHVQ, Wednesday closure, dynamic updates) | 7+ |
| **Tier 1** | `backend/tests/integration/e2e/tier1-menu-pescato-avvisi.e2e.test.ts` | Menu CRUD & Mockup Seafood Dishes, Category Filtering, 14-EU Allergen Exclusion, Pescato del Giorno / Diario di Bordo, Dynamic Avvisi & Culinary Eventi Banners | 12+ |
| **Tier 1** | `backend/tests/integration/e2e/tier1-audit-logging.e2e.test.ts` | Granular Audit Trail (Operator username/email, IP, action, timestamp, sensitive credentials redaction, Admin log query) | 5+ |
| **Tier 2** | `backend/tests/integration/e2e/tier2-boundaries-corner-cases.e2e.test.ts` | Empty Credentials, Case-Insensitive Auth, Corrupted JWTs, Concurrent Logouts, Negative/Zero Prices, Unicode/Dialect/Emoji Integrity, String Length Boundaries, Date Window Edges | 10+ |
| **Tier 3** | `backend/tests/integration/e2e/tier3-cross-feature-combinations.e2e.test.ts` | Pairwise Cross-Feature Interactions: Create Gestore -> Login -> Menu Mutation -> AuditLog Verification -> Global Logout -> Token Revocation; Allergen Mutation -> Search Filtering Consistency; Emergency Banner Publishing -> Live View -> Deactivation | 3 flows |
| **Tier 4** | `backend/tests/integration/e2e/tier4-real-world-scenarios.e2e.test.ts` | Full Operational Day Lifecycle (Morning market catch -> Midday notice -> Customer dinner booking & menu filtering -> Night administrative audit); Seasonal Mockup Seafood Onboarding; Event Reservation Progression | 3 scenarios |
| **Runner** | `tests/e2e/runner.js` | Dedicated CLI test runner script orchestrating Supertest and Jest execution across all E2E suites | 1 script |

---

## 3. How to Execute Tests

1. **Run Full E2E Test Suite (Tiers 1-4)**:
   ```bash
   npm --prefix backend run test -- --testPathPattern=tests/integration/e2e
   ```

2. **Run Monorepo Test Command**:
   ```bash
   npm test
   ```

3. **Run Dedicated E2E Runner**:
   ```bash
   node tests/e2e/runner.js
   ```

4. **Run Test Coverage**:
   ```bash
   npm --prefix backend run test:coverage
   ```

---

## 4. Verification & Readiness Assessment

- **Hermeticity**: Tests use `mongodb-memory-server` and clear all state between tests in `beforeEach`.
- **Integrity**: Zero facade tests, zero hardcoded passes, genuine Mongoose validation and Express response assertions.
- **Specification Alignment**: 100% compliant with `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, and `materiale_utile/`.
