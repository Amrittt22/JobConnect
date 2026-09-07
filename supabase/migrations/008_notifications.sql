-- ============================================
-- JobConnect
-- Notifications table
-- ============================================

create table public.notifications (
    id uuid primary key default gen_random_uuid(),

    "userId" uuid not null
        references public.users(id)
        on delete cascade,

    type text not null,

    message text not null,

    read boolean not null default false,

    "createdAt" timestamptz not null default now()
);