# E2E Test Infra: Il Veliero

## Test Philosophy
- Opaque-box, requirement-driven. Derives test cases from ORIGINAL_REQUEST requirements.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing across Tiers 1–4.

## Feature Inventory & Test Matrix
| # | Feature | Requirement Source | Tier 1 | Tier 2 | Tier 3 |
|---|---------|-------------------|:------:|:------:|:------:|
| 1 | Dishoom Palette & Visual Tokens | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 2 | Typography Hierarchy & Serif Headings | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 3 | Authentic Veliero Engraving Asset | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 4 | Hero Section Contrast & Video Wall | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 5 | Homepage Notice Banner Removal | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 6 | Dishoom Archive Frame Cards (3 cards) | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 7 | Refined Archival Footer & Fiscal Data | ORIGINAL_REQUEST R2 | 5 | 5 | ✓ |
| 8 | Printed Dining Card Menu & Leaders | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 9 | Removal of Cartoon Wood Plaques | ORIGINAL_REQUEST R3 | 5 | 5 | ✓ |
| 10 | Secondary Pages Harmonization | ORIGINAL_REQUEST R1 | 5 | 5 | ✓ |
| 11 | Complete Removal of admin@ilveliero.it | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |
| 12 | Master Admin Authorization | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |
| 13 | Audit Log Role Tracking (Non-Anonymous) | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |
| 14 | Audit Log Search Debouncing | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |
| 15 | Unified Centro Tecnico (/admin/security) | ORIGINAL_REQUEST R4 | 5 | 5 | ✓ |
| 16 | Docker Multi-Service Health | ORIGINAL_REQUEST Criteria | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Automated Node/TypeScript & PowerShell test suites executing HTTP API calls and checking frontend compilation & DOM structures.
- Pass/Fail semantics: All tests must exit with code 0.
- Location: `tests/e2e/` or backend integration test runner + Docker health tests.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Customer Browsing & Ordering Experience: View Hero, navigate via Dishoom Archive Cards to Menu, inspect double-column dishes and prices with dot leaders | F1, F2, F3, F4, F6, F8, F9 | High |
| 2 | Master Admin Authentication & Session Management: Login with `bortolatofilippo05@gmail.com` and `pizzadalcampione@gmail.com`, verify Master Admin protection | F11, F12, F13 | High |
| 3 | Centro Tecnico Audit Inspection: Rapid search/filtering of audit logs, verifying debouncing and correct `admin` role tracking | F13, F14, F15 | High |
| 4 | Multi-Service Docker Orchestration & Live Recovery: Rebuilding images, booting containers, validating healthcheck endpoints on ports 4200, 5000, 27017 | F16 | High |
| 5 | Legacy Admin Access Prevention: Attempting authentication and searching database for `admin@ilveliero.it` confirming total eradication | F11, F13 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature (~80 tests)
- Tier 2: ≥5 per feature (~80 tests)
- Tier 3: Pairwise combinations of major features (~16 interaction tests)
- Tier 4: ≥5 realistic end-to-end application scenarios
