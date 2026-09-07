-- ============================================
-- JobConnect
-- Messages table
-- ============================================

-- Recruiter
--     │
--     ▼
-- Socket.io
--     │
--     ▼
-- Express
--     │
--     ├── save message
--     ▼
-- PostgreSQL
--     │
--     ▼
-- messages

create table public.messages (
    id uuid primary key default gen_random_uuid(),

    "conversationId" uuid not null
        references public.conversations(id)
        on delete cascade,

    "senderId" uuid not null
        references public.users(id)
        on delete cascade,

    "receiverId" uuid not null
        references public.users(id)
        on delete cascade,

    text text not null,

    timestamp timestamptz not null default now(),

    read boolean not null default false
);