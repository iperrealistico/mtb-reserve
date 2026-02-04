# Operations Hub: MVP Fix & Complete

**Goal**: Fix and complete the MTBR MVP strictly within the original scope.
**Scope Constraints**: NO new features (billing, analytics, roles). Only original MVP requirements.

## Current Status
- [x] Audit Completed
- [ ] Initialization (Operations Hub created)
- [ ] Step 1: Fix Expired Pending Availability
- [ ] Step 2: Fix Timezone Handling
- [ ] Step 3: Parametrize Slots
- [ ] Step 4: Admin Calendar
- [ ] Step 5: Admin Settings
- [ ] Step 6: Real Email
- [ ] Step 7: Documentation

## Implementation Checklist

### Step 1: Fix Expired Pending Availability (Risk: High)
- [x] Modify `lib/availability.ts` to exclude expired PENDING bookings
- [x] Modify `app/[slug]/actions.ts` confirmation to reject expired tokens
- [x] Verify with smoke-test (create pending -> expire -> check availability)

### Step 2: Fix Timezone Handling (Risk: High)
- [x] Install `date-fns-tz` (if needed)
- [x] Ensure `actions.ts` constructs dates in Tenant timezone (default Europe/Rome)
- [x] Verify 09:00 slot = 09:00 Local, not UTC

### Step 3: Parametrize Slots (Risk: Med)
- [x] Define `TenantSettings` interface
- [x] Update `actions.ts` to read slots from `Tenant.settings`
- [x] Handle fallback to default slots
- [x] Ensure full-day logic works with dynamic slots

### Step 4: Admin Calendar (Risk: Low)
- [x] Replace "Coming soon" in `admin/calendar/page.tsx`
- [x] Add Day Picker
- [x] Add Booking List (grouped by slot/bike)
- [x] Add Actions (Cancel, Resend Email)

### Step 5: Admin Settings (Risk: Med)
- [x] Replace "Coming soon" in `admin/settings/page.tsx`
- [x] Form for Tenant Contact Info
- [x] Form for Slot Configuration
- [x] Form for Inventory (Stock/Broken)

### Step 6: Real Email (Risk: Low)
- [x] Install `resend` SDK
- [x] Create Email Service (src/lib/email.ts)
- [x] Replace `console.log` in `actions.ts`
- [x] Add `EMAIL_DISABLED` env var check

### Step 7: Documentation & Wrap-up
- [x] Create `SETUP.md`
- [x] Create `TESTING.md`
- [x] Final Verification

## Risks & Mitigations
- **Data Loss**: No raw SQL updates. Use Prisma migrations if needed (avoid if possible).
- **Timezone Confusion**: Stick to "Store dates in UTC, Display/Input in Tenant Zone".
- **Email Spam**: Ensure `EMAIL_DISABLED=true` is default in dev.

## Change Log
- Initialized Operations Hub.
