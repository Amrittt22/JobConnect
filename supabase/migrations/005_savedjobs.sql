-- ============================================
-- JobConnect
-- Saved Jobs table
-- ============================================

create table public.saved_jobs (
    "userId" uuid not null
        references public.users(id)
        on delete cascade,

    "jobId" uuid not null
        references public.jobs(id)
        on delete cascade,

    "createdAt" timestamptz not null default now(),

    primary key ("userId", "jobId")
);