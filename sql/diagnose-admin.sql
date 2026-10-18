-- Lecture seule. Remplacer l'UUID par celui du compte concerné.
select u.id, u.email_confirmed_at is not null as email_confirme,
 a.role, a.role in ('super_admin','editor') as acces_admin_autorise
from auth.users u left join public.admin_users a on a.user_id=u.id
where u.id='00000000-0000-0000-0000-000000000000'::uuid;

select to_regprocedure('public.current_admin_role()') as fonction_role,
 has_function_privilege('authenticated','public.current_admin_role()','execute') as rpc_autorisee;
