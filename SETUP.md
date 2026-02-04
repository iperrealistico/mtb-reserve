# Setup Guide: MTB Reserve (MTBR)

## Environment Variables

Copy `.env` to `.env.local` and configure:

```ini
# Database
DATABASE_URL="postgresql://..."

# Auth (Session Secret)
SESSION_SECRET="complex_long_string_at_least_32_chars"

# Base URL (for email links)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Email Service (Resend)
RESEND_API_KEY="re_..." 
FROM_EMAIL="onboarding@resend.dev"

# Dev Flags
# Set to "1" or "true" to log emails to console instead of sending
EMAIL_DISABLED="false" 
```

## Manual Tenant Onboarding

Currently, there is no Super-Admin UI. To add a new shop (Tenant):

1.  **Generate Password Hash**:
    Use a tool or script to hash the password (bcrypt).
    ```bash
    # Example script usage (if available) or online generator
    # Hashes should be bcrypt compatible.
    ```
2.  **Insert into Database**:
    Access your database (e.g., via `prisma studio` or SQL client).
    ```sql
    INSERT INTO "Tenant" (slug, name, adminPasswordHash, contactEmail, timezone)
    VALUES ('myshop', 'My Bike Shop', '$2b$10$...', 'info@myshop.com', 'Europe/Rome');
    ```
3.  **Configure Settings (Optional)**:
    Start the app, log in as `myshop`, and go to `/myshop/admin/settings` to configure slots.

## Timezones

The system defaults to `Europe/Rome`.
To change a tenant's timezone, update the `timezone` column in the `Tenant` table to a valid IANA string (e.g., `Europe/London`, `America/New_York`).
All booking slots will automatically respect this timezone.

## Deployment (Vercel)

1.  Push to GitHub.
2.  Import project in Vercel.
3.  Set Environment Variables in Vercel Dashboard.
4.  **Important**: Ensure your Database is accessible from Vercel (e.g., Neon, Supabase, or allow-listed IP).
