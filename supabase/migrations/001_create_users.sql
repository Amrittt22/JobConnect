-- ============================================
-- JobConnect
-- Users table
-- ============================================

create type user_role as enum (
    'JOBSEEKER',
    'RECRUITER',
    'ADMIN'
);

create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,

    name text not null,
    email text not null unique,

    role user_role not null default 'JOBSEEKER',

    "profilePic" text,
    "resumeUrl" text,

    skills text[] default '{}',

    bio text,
    location text,

    "isSuspended" boolean not null default false,

    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);