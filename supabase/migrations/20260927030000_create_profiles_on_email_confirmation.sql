drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.sync_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text;
  requested_name text;
  requested_organization text;
begin
  requested_type := new.raw_user_meta_data ->> 'account_type';
  if requested_type is null or requested_type not in ('farmer', 'provider') then
    raise exception 'Choose a valid account type';
  end if;

  requested_name := btrim(coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  if char_length(requested_name) not between 2 and 80 then
    raise exception 'Full name must be between 2 and 80 characters';
  end if;

  requested_organization := btrim(coalesce(new.raw_user_meta_data ->> 'organization_name', ''));
  if char_length(requested_organization) > 120 then
    raise exception 'Farm or organization name must be 120 characters or fewer';
  end if;

  if new.email_confirmed_at is not null then
    insert into public.profiles (id, account_type, full_name, organization_name)
    values (new.id, requested_type, requested_name, requested_organization)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.sync_profile_for_auth_user();

create trigger on_auth_user_email_confirmed
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.sync_profile_for_auth_user();
