begin;
create table public.history_milestones (
 id uuid primary key default gen_random_uuid(), year integer check(year between 1800 and 2200),
 title_fr text not null, title_ar text not null default '', description_fr text, description_ar text, image_url text,
 sort_order integer not null default 0, is_visible boolean not null default true
);
create table public.club_objectives (
 id uuid primary key default gen_random_uuid(), icon text not null default 'youth' check(icon in ('youth','ball','team','trophy')), title_fr text not null, title_ar text not null default '',
 description_fr text, description_ar text, sort_order integer not null default 0, is_visible boolean not null default true
);
create table public.club_values (
 id uuid primary key default gen_random_uuid(), icon text not null default 'respect' check(icon in ('respect','rigor','solidarity','passion')), title_fr text not null, title_ar text not null default '',
 description_fr text, description_ar text, sort_order integer not null default 0, is_visible boolean not null default true
);
create table public.players (
 id uuid primary key default gen_random_uuid(), full_name text not null check(length(full_name) between 1 and 150), photo_url text,
 shirt_number integer check(shirt_number between 0 and 999), position text not null check(position in ('Gardiens','Défenseurs','Milieux','Attaquants')),
 nationality text, date_of_birth date, biography_fr text, biography_ar text,
 is_captain boolean not null default false, is_active boolean not null default true, is_featured boolean not null default false,
 sort_order integer not null default 0, is_visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.staff_members (
 id uuid primary key default gen_random_uuid(), full_name text not null, photo_url text, role_fr text not null, role_ar text,
 biography_fr text, biography_ar text, sort_order integer not null default 0, is_visible boolean not null default true
);
create table public.bureau_members (
 id uuid primary key default gen_random_uuid(), full_name text not null, photo_url text, role_fr text not null, role_ar text,
 biography_fr text, biography_ar text, mandate_start date, mandate_end date, is_president boolean not null default false,
 is_featured boolean not null default false, sort_order integer not null default 0, is_visible boolean not null default true,
 check(mandate_end is null or mandate_start is null or mandate_end >= mandate_start)
);
create unique index one_president on public.bureau_members(is_president) where is_president and is_visible;
create table public.gallery_categories (
 id uuid primary key default gen_random_uuid(), name_fr text not null, name_ar text, slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 sort_order integer not null default 0, is_visible boolean not null default true
);
create table public.gallery_images (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.gallery_categories(id) on delete restrict,
 image_url text not null, title_fr text not null, title_ar text, description_fr text, description_ar text, taken_at date,
 sort_order integer not null default 0, is_visible boolean not null default true, is_featured boolean not null default false,
 created_at timestamptz not null default now()
);
create index gallery_category_idx on public.gallery_images(category_id);
create table public.contact_messages (
 id uuid primary key default gen_random_uuid(), full_name text not null check(length(full_name) between 2 and 100),
 email text not null check(length(email) between 3 and 254), phone text check(length(phone)<=30),
 subject text not null check(length(subject) between 3 and 150), message text not null check(length(message) between 10 and 5000),
 status text not null default 'new' check(status in ('new','read','processed','archived')), created_at timestamptz not null default now()
);
create index contact_status_date_idx on public.contact_messages(status,created_at desc);
create table public.media_assets (
 id uuid primary key default gen_random_uuid(), bucket_id text not null, object_path text not null, public_url text not null unique,
 mime_type text not null, size_bytes integer not null check(size_bytes between 1 and 5242880),
 created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), unique(bucket_id,object_path)
);
create table public.activity_logs (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 table_name text not null, record_id text not null, operation text not null, created_at timestamptz not null default now()
);
create table private.contact_rate_limits (key text primary key, attempts integer not null, expires_at timestamptz not null);
commit;
