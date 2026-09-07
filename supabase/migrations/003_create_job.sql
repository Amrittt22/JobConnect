-- ============================================
-- JobConnect
-- Jobs table
-- ============================================

create type job_type as enum (
    'FULL_TIME',
    'PART_TIME',
    'INTERNSHIP',
    'CONTRACT'
);

create type job_status as enum (
    'OPEN',
    'CLOSED'
);

create table public.jobs (
    id uuid primary key default gen_random_uuid(),

    title text not null,

    description text not null,

    "companyId" uuid not null
        references public.companies(id)
        on delete cascade,

    "postedById" uuid not null
        references public.users(id)
        on delete cascade,

    location text,

    "salaryMin" numeric,

    "salaryMax" numeric,

    "skillsRequired" text[] default '{}',

    "jobType" job_type not null,

    status job_status not null default 'OPEN',

    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now(),

    constraint salary_range_check
        check (
            "salaryMin" is null
            or "salaryMax" is null
            or "salaryMin" <= "salaryMax"
        )
);