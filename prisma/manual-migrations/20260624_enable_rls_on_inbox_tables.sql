BEGIN;

-- Legacy MTB Reserve mailbox tables are not used by the current live app, but
-- they remain in the Prisma schema and public Supabase schema. Keep them hidden
-- from PostgREST anon/authenticated roles by enabling RLS without public
-- policies, matching the existing shared-table hardening posture.

ALTER TABLE public."InboxThread" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InboxMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InboxAttachment" ENABLE ROW LEVEL SECURITY;

COMMIT;
