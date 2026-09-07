-- ============================================
-- JobConnect
-- Applications table
-- ============================================

create type application_status as enum (
    'APPLIED',
    'SHORTLISTED',
    'REJECTED',
    'HIRED'
);

create table public.applications (
    id uuid primary key default gen_random_uuid(),

    "jobId" uuid not null
        references public.jobs(id)
        on delete cascade,

    "applicantId" uuid not null
        references public.users(id)
        on delete cascade,

    status application_status not null default 'APPLIED',

    "resumeUrl" text,

    "appliedAt" timestamptz not null default now(),

    "updatedAt" timestamptz not null default now(),

    constraint unique_job_applicant
        unique ("jobId", "applicantId")
);