alter table public.profiles
  add constraint profiles_full_name_length_check
    check (char_length(btrim(full_name)) = 0 or char_length(btrim(full_name)) between 2 and 80),
  add constraint profiles_organization_name_length_check
    check (char_length(btrim(organization_name)) <= 120);

alter table public.food_listings
  add constraint food_listings_description_length_check
    check (char_length(description) <= 1000),
  add constraint food_listings_pickup_address_length_check
    check (char_length(btrim(pickup_address)) between 1 and 300),
  add constraint food_listings_quantity_limit_check
    check (quantity <= 10000000);

create function public.validate_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.full_name is distinct from old.full_name
    and char_length(btrim(new.full_name)) not between 2 and 80 then
    raise exception 'Full name must be between 2 and 80 characters';
  end if;

  if char_length(btrim(new.organization_name)) > 120 then
    raise exception 'Farm or organization name must be 120 characters or fewer';
  end if;

  if new.phone is not null and (
    char_length(btrim(new.phone)) > 30
    or btrim(new.phone) = ''
    or btrim(new.phone) !~ '^[+()0-9 .-]+$'
  ) then
    raise exception 'Enter a valid phone number of 30 characters or fewer';
  end if;

  return new;
end;
$$;

create trigger profiles_validate_fields
before update on public.profiles
for each row execute function public.validate_profile_fields();

create or replace function public.create_profile_for_new_user()
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

  insert into public.profiles (id, account_type, full_name, organization_name)
  values (new.id, requested_type, requested_name, requested_organization);

  return new;
end;
$$;
