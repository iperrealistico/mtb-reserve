# Testing Guide

We have created several verification scripts to ensure core logic correctness.

## Prerequisites

- Node.js & NPM installed.
- Database running and `DATABASE_URL` set in `.env`.
- `npx prisma generate` run recently.

## Running Verification Scripts

Use `npx tsx` to run the typescript scripts directly.

### 1. Verify Availability Logic
Checks that expired pending bookings are correctly ignored and do not block inventory.
```bash
npx tsx scripts/verify-availability.ts
```

### 2. Verify Timezone Logic
Checks that dates/times are correctly converted between Local Tenant Time and UTC.
```bash
npx tsx scripts/verify-timezone.ts
```

### 3. Verify Dynamic Slots
Checks that custom slots (JSON) are parsed correctly and "Full Day" logic is applied.
```bash
npx tsx scripts/verify-slots.ts
```

### 4. Verify Calendar Actions
Checks that the Admin Calendar action correctly fetches bookings for a specific day.
```bash
npx tsx scripts/verify-calendar.ts
```

### 5. Verify Settings Persistence
Checks that Admin Settings form updates are saved to the database.
```bash
npx tsx scripts/verify-settings.ts
```

## Continuous Integration (CI)

Ideally, these scripts can be added to a CI pipeline or `package.json` scripts:
```json
"test:scripts": "npx tsx scripts/verify-availability.ts && npx tsx scripts/verify-timezone.ts ..."
```
