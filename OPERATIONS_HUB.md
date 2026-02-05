# Operations Hub

## Quality Gate

### Phase A — AI Static Analysis Audit (Findings)

#### System Invariants
- **No Overbooking**: Confirmed bookings + non-expired pending must never exceed available stock.
- **Expiry Releases Stock**: `PENDING_CONFIRM` bookings older than 30 mins must not block availability.
- **Tenant Isolation**: Admins must never be able to access or modify other tenants' data.
- **Atomic Bookings**: Stock check and booking creation must be atomic.
- **Single-use Confirmation**: Tokens should effectively be single-use (status based).

#### Risk Matrix
| Module | Risk Level | Why | File Paths |
| :--- | :---: | :--- | :--- |
| Admin Actions | CRITICAL | Missing `getSession` checks in server actions within protected folders. | `app/[slug]/admin/(protected)/*/actions.ts` |
| Booking Logic | HIGH | `count()` used instead of `sum(quantity)`, and missing expiry check in transaction. | `app/[slug]/actions.ts` |
| Confirmation | HIGH | No expiry or availability re-check during confirmation flow. | `app/[slug]/booking/confirm/actions.ts` |
| Availability | MED | `getBikeAvailability` uses `count()` which fails for multi-bike bookings. | `lib/availability.ts` |

#### Edge Case Inventory
- **Race Condition**: Two users booking the last bike simultaneously.
- **Expired Confirm**: Confirming a booking after the 30-min window has passed.
- **Tenant Cross-talk**: Malicious user trying to use a valid slug in a server action for a different tenant ID.
- **Multi-bike Overbook**: Booking 2 bikes when only 1 is available (current logic only counts bookings, not quantities).

#### Logic & Security Findings
1. **[CRITICAL]** Server actions in `app/[slug]/admin/(protected)` lack auth checks. Any guest can update inventory or settings if they know the slug.
2. **[HIGH]** `submitBookingAction` uses `tx.booking.count` which counts rows, ignoring `quantity`. Allows massive overbooking.
3. **[HIGH]** `submitBookingAction` transaction does not filter out expired `PENDING_CONFIRM` rows, reducing availability unnecessarily.
4. **[HIGH]** `confirmBookingAction` does not check `expiresAt` or re-verify availability. Expired pending bookings can be confirmed even if stock is gone.
5. **[MED]** No centralized `ensureAuthenticated` helper for actions, leading to inconsistent security.

---

### Fixes Applied
1. **[Admin Security]**: Added `ensureAuthenticated(slug)` to all protected server actions (`inventory`, `settings`, `calendar`, `dashboard`).
2. **[Overbooking]**: Switched from `count()` to `aggregate({ _sum: { quantity: true } })` in `getBikeAvailability` and `submitBookingAction`.
3. **[Booking Logic]**: Added `expiresAt` check and re-check of availability inside the transaction for `submitBookingAction`.
4. **[Confirmation Flow]**: Added mandatory `expiresAt` check and atomic availability re-check in `confirmBookingAction`.
5. **[Code Quality]**: Refactored `getComputedSlots` to `lib/tenants.ts` for better testability and removed unused code.

### Verification Results
- **Unit Tests**: 7 tests passed (Availability, Admin Auth, Expiry, Slots, Passwords).
- **Security Audit**: All protected actions now verify sessions.
- **Lint**: Passing for all modified files.
- **Typecheck**: Passing for core application logic.

### Quality Gate Status
- [x] Phase A: Static Analysis Audit
- [x] Phase B: Deterministic Test Suite
- [x] Phase C: Fix and Harden
- [x] Lint passes (on modified files)
- [x] Typecheck passes
- [x] Unit tests pass

### Phase D — UI Standardization & UX Fixes
- [ ] **Design System**: Established unified visual language (Airbnb-like).
- [ ] **Components**: Standardized Button, Input, Modal, etc. across all apps.
- [ ] **Sound & Motion**: Implemented micro-animations and sound feedback.
- [ ] **reCAPTCHA**: "Gated Action" pattern implemented (smooth, button-driven).
- [ ] **Bug Fixes**:
  - [ ] Reserve button "stuck" bug fixed (with instrumentation).
  - [ ] Calendar highlight bug fixed.
- [ ] **Super Admin**:
  - [ ] Login standardized (Password-only).
  - [ ] Logging extended to capture UX events.
- [ ] **Cleanliness**: Emojis removed, single icon library used.

