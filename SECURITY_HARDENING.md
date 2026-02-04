# Security Hardening Documentation

## Threat Model

The primary threats to MTBR/MTB Reserve are:
1.  **Unauthorized Access (Account Takeover):** Attackers guessing passwords or bypassing authentication to access tenant or super-admin accounts.
2.  **Abuse (Spam/DoS):** Automated bots flooding booking requests, password resets, or email verification endpoints, leading to resource exhaustion or high email costs.
3.  **Privilege Escalation:** Tenants accessing other tenants' data or super-admin functions.
4.  **Data Leakage:** Exposure of sensitive information (passwords, PII) via error messages, logs, or insecure endpoints.
5.  **Cross-Site Scripting (XSS) & CSRF:** Injecting malicious scripts or tricking users into performing unwanted actions.

## Implemented Protections

### Authentication & Sessions
- **HttpOnly, Secure, SameSite Cookies:** Prevents XSS theft and CSRF (via SameSite).
- **Session Rotation:** Session IDs are regenerated on login to prevent fixation.
- **Tenant Isolation:** Admin sessions are strictly scoped to the authorized tenant `slug`.

### Rate Limiting & Anti-Bot
- **Durable Storage:** Using a database-backed or Vercel KV store for reliable tracking across serverless functions.
- **Rate Limits:**
  - Login: Strict limits (e.g., 5 attempts/15min) with IP backoff.
  - Booking & Emails: Limits on creation and resends to prevent spam.
  - Password Reset: Limits to prevent enumeration and spam.
- **reCAPTCHA v2/v3:** Integrated into all public forms (login, booking, reset) to distinguishing humans from bots.

### Access Control
- **No Plaintext Passwords:** Super-admins cannot view tenant passwords. Reset/Rotate only.
- **Secure Impersonation:** Short-lived (5-15 min), single-use tokens for support, fully audited.

### Infrastructure Security
- **Security Headers:**
  - `Content-Security-Policy`: Restricts script sources (Google reCAPTCHA, self).
  - `HSTS`: Enforced in production.
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or SAMEORIGIN if needed).
- **Audit Logging:** Critical actions (login, reset, impersonation) are logged to a persistent store.

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `RECAPTCHA_SITE_KEY` | Public key for Google reCAPTCHA. |
| `RECAPTCHA_SECRET_KEY` | Secret key for verification (server-side). |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | (Optional) Upstash/Vercel KV credentials for rate limiting. |
| `DATABASE_URL` | Connection string for the primary database (PostgreSQL). |
| `RESEND_API_KEY` | Key for sending transactional emails. |

## Secret Rotation

1.  **reCAPTCHA Keys:** Generate new keys in Google Admin Console. Update Vercel env vars. Redeploy. Low impact if done quickly.
2.  **Database URL:** Rotate credentials in database provider. Update Vercel env var immediately. Service interruption during update.
3.  **Resend API Key:** Generate new key in Resend dashboard. Update Vercel.

## Rate Limiting Configuration
We utilize a durable store (Postgres or Vercel KV) to track request counts.
- **Window:** 15 minutes for logins, 60 seconds for email resends.
- **Block:** IP-based blocking after threshold webceeded.
