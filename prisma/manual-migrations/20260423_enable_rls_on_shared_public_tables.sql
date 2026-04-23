BEGIN;

-- Shared Supabase tables used by MTB Reserve should not be accessible through
-- public PostgREST/Supabase clients. The app uses direct server-side Postgres
-- access, so enabling RLS without adding policies preserves owner access while
-- default-denying anon/authenticated roles.

ALTER TABLE public."BikeType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AdminLoginAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SuperAdmin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RateLimit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EventLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SystemSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SignupRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AboutPageContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BookingItem" ENABLE ROW LEVEL SECURITY;

COMMIT;
