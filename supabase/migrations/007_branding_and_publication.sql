begin;

-- Overrides facultatifs : NULL conserve le logo principal partout.
alter table public.site_settings add column if not exists header_logo_url text;
alter table public.site_settings add column if not exists footer_logo_url text;
alter table public.site_settings add constraint header_logo_url_safe check(public.is_safe_url(header_logo_url));
alter table public.site_settings add constraint footer_logo_url_safe check(public.is_safe_url(footer_logo_url));

-- Un trophée lié à une saison masquée ne doit pas rester public.
alter policy published_trophies on public.trophies
 using(is_visible
  and (competition_id is null or exists(select 1 from public.competitions c where c.id=competition_id))
  and (season_id is null or exists(select 1 from public.seasons s where s.id=season_id and s.is_visible)));

commit;
