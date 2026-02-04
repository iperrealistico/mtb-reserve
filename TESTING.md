# Testing Guide

This project uses **Vitest** for unit and integration tests, and **Playwright** for E2E tests.

## Prerequisites
- Node.js 20+
- A test database (optional for unit tests, required for integration tests)

## Environment Variables
For integration tests, set up a `.env.test` file:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mtb_reserve_test?schema=public"
TEST_MODE=true
```

## Running Tests

### Unit Tests (Fast)
```bash
npm run test:unit
```
These tests use mocks for the database and external services.

### Integration Tests
```bash
npm run test:integration
```
These tests run against a real (isolated) database.

### E2E Tests
```bash
npx playwright install
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

## IDE Integration
You can run tests directly from the **Tests** tab in VS Code or JetBrains IDEs by selecting "Vitest" as the test runner.

## Mocking and Stubs
- **Time**: Use `vi.setSystemTime` to control time-based logic (expiry, cooldowns).
- **Emails**: Emails are mocked in `test/setup.ts` using `vi.mock('resend')`.
- **ReCAPTCHA**: ReCAPTCHA always returns `true` in test mode via `test/setup.ts`.
- **Database**: Unit tests mock the Prisma `db` client. Integration tests use an isolated schema.

## Troubleshooting
- If tests fail due to Prisma errors, ensure `npx prisma db push` has been run on the test database.
- If E2E tests fail, ensure the dev server is running or use `npx playwright test --ui`.
