-- ============================================
-- JobConnect
-- Conversations table
-- ============================================


create table public.conversations (
    id uuid primary key default gen_random_uuid(),

    "recruiterId" uuid not null
        references public.users(id)
        on delete cascade,

    "candidateId" uuid not null
        references public.users(id)
        on delete cascade,

    "createdAt" timestamptz not null default now(),

    "updatedAt" timestamptz not null default now(),

    constraint unique_conversation
        unique ("recruiterId", "candidateId"),

    constraint different_users
        check ("recruiterId" <> "candidateId")
);