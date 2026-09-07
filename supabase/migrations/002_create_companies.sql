-- ============================================
-- JobConnect
-- Companies table
-- ============================================

create table public.companies (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    "logoUrl" text,

    description text,

    website text,

    industry text,

    "recruiterId" uuid not null
        references public.users(id)
        on delete cascade,

    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);