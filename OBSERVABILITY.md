# Observability & Logging System

This document describes the observability stack implemented for MTB Reserve.

## Architecture

The system uses a "Store & Stream" approach:
1. **Persistent Audit Log**: Events are stored in Postgres (`EventLog` table) for historical analysis, non-repudiation, and in-app viewing.
2. **Operational Streams**: Events are emitted to `console` in structured JSON format. On Vercel, these are automatically captured by Vercel Logs and can be drained to external tools (Datadog, Axiom, etc.).

## 1. What is Logged?

We log "Significant Business Events" and "Operational Failures".

### Events
- **Auth**: Login (Success/Fail), Logout, Password Reset.
- **Booking**: Requested, Confirmed, Cancelled.
- **Email**: Sent, Failed (with Provider ID).
- **Security**: Rate Limit Blocked, Captcha Failed, Impersonation Used.

### Schema
Every event includes:
- `level`: INFO / WARN / ERROR
- `actor`: Type (Super Admin, Tenant, System, Guest) + ID.
- `metadata`: JSON payload with context.
- `ipHash`: Salted hash of IP address (SHA-256).

## 2. Privacy & Security

### Secrets Redaction
All metadata is passed through a sanitization layer before storage.
- **Redacted Keys**: password, token, secret, key, authorization, cookie, session, creditcard.
- **Value Replacement**: `[REDACTED]`

### IP Handling
- **Raw IP Addresses** are NOT stored permanently in the database `metadata` (unless explicitly needed for debugging, but discouraged).
- **Hashed IP** (`ipHash`) is stored for correlation/abuse detection without exposing raw PII.
- **Salt**: Hashing uses `IP_SALT` env var. If rotated, historical correlation breaks (privacy feature).

## 3. Retention Strategy

- **Database**: Indefinite by default.
  - *Recommendation*: Implement a cron job to purge `INFO` logs > 90 days if storage grows.
  - *Keep*: `WARN`/`ERROR` and Auth events for at least 1 year (compliance).
- **Vercel Logs**: Depends on plan (usually 1-3 days on free/pro).

## 4. Usage

### Log Event in Code
```typescript
import { logEvent } from "@/lib/events";

await logEvent({
  level: "INFO",
  actorType: "SYSTEM",
  eventType: "JOB_COMPLETED",
  message: "Daily cleanup finished",
  metadata: { deletedCount: 5 }
});
```

### Viewing Logs
- **Super Admin**: Go to `/admin/logs`.
- **Health Dashboard**: Go to `/admin/health` for 24h metrics.
- **Email Delivery**: Go to `/admin/emails`.

## 5. Setup

### Environment Variables
| Variable | Purpose | Default |
|----------|---------|---------|
| `IP_SALT` | Salt for IP hashing | `dev-salt...` |
| `EMAIL_DISABLED` | If "1", logs mock emails instead of sending | - |

