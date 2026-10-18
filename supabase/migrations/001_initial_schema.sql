begin;
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('super_admin','editor')),
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create function public.current_admin_role() returns text language sql stable security definer set search_path = '' as $$
 select role from public.admin_users where user_id = (select auth.uid())
$$;
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select coalesce(public.current_admin_role() in ('super_admin','editor'), false)
$$;
create function public.is_super_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select coalesce(public.current_admin_role() = 'super_admin', false)
$$;
revoke all on function public.current_admin_role(), public.is_admin(), public.is_super_admin() from public;
grant execute on function public.current_admin_role(), public.is_admin(), public.is_super_admin() to anon, authenticated;

create table public.site_settings (
 id uuid primary key default gen_random_uuid(), singleton boolean not null default true unique check(singleton),
 club_name text not null default 'AJT TAGANT', club_name_ar text not null default '', slogan text not null default '', slogan_ar text not null default '',
 logo_url text, favicon_url text, primary_color text not null default '#2F4294', secondary_color text not null default '#101A49',
 accent_color text not null default '#F8DA32', background_color text not null default '#FFFFFF',
 heading_font text not null default 'Anton' check(heading_font in ('Anton','Oswald','Cairo')),
 body_font text not null default 'Poppins' check(body_font in ('Poppins','Cairo')),
 contact_email text, contact_phone text, whatsapp_url text, address text, address_ar text, map_url text,
 facebook_url text, instagram_url text, youtube_url text, tiktok_url text, footer_text text,
 seo_title text, seo_description text, seo_image_url text, updated_at timestamptz not null default now(),
 check(primary_color ~ '^#[0-9A-Fa-f]{6}$'), check(secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
 check(accent_color ~ '^#[0-9A-Fa-f]{6}$'), check(background_color ~ '^#[0-9A-Fa-f]{6}$')
);
create table public.navigation_items (
 id uuid primary key default gen_random_uuid(), label_fr text not null, label_ar text not null default '', href text not null,
 sort_order integer not null default 0, is_visible boolean not null default true,
 check((href ~ '^/([^/\\][^\\]*)?$' or href ~ '^https://') and href !~ '[[:cntrl:]]')
);
create table public.page_content (
 id uuid primary key default gen_random_uuid(), page_key text not null, section_key text not null,
 title_fr text, title_ar text, subtitle_fr text, subtitle_ar text, content_fr text, content_ar text, image_url text,
 button_label_fr text, button_label_ar text, button_url text,
 sort_order integer not null default 0, is_visible boolean not null default true,
 settings_json jsonb not null default '{}'::jsonb check(jsonb_typeof(settings_json)='object'),
 updated_at timestamptz not null default now(), unique(page_key,section_key)
);
create table public.homepage_sections (
 id uuid primary key default gen_random_uuid(), section_key text not null unique,
 sort_order integer not null default 0, is_visible boolean not null default true,
 settings_json jsonb not null default '{}'::jsonb check(jsonb_typeof(settings_json)='object'), updated_at timestamptz not null default now()
);
commit;
