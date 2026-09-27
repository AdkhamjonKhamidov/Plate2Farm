create extension if not exists postgis with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('farmer', 'provider')),
  full_name text not null default '',
  organization_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_type text;
begin
  requested_type := new.raw_user_meta_data ->> 'account_type';
  if requested_type is null or requested_type not in ('farmer', 'provider') then
    requested_type := 'provider';
  end if;

  insert into public.profiles (id, account_type, full_name, organization_name)
  values (
    new.id,
    requested_type,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'organization_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

insert into public.profiles (id, account_type, full_name, organization_name)
select
  u.id,
  case
    when u.raw_user_meta_data ->> 'account_type' in ('farmer', 'provider')
      then u.raw_user_meta_data ->> 'account_type'
    else 'provider'
  end,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(u.raw_user_meta_data ->> 'organization_name', '')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

create table public.food_listings (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid not null references public.profiles (id) on delete cascade,
  provider_name text not null,
  title text not null check (length(trim(title)) between 1 and 120),
  description text not null default '',
  category text not null default 'other'
    check (category in ('produce', 'dairy', 'bakery', 'prepared', 'pantry', 'other')),
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null default 'items'
    check (unit in ('items', 'kg', 'lb', 'boxes', 'bags', 'meals')),
  image_url text,
  pickup_address text not null,
  pickup_latitude double precision not null check (pickup_latitude between -90 and 90),
  pickup_longitude double precision not null check (pickup_longitude between -180 and 180),
  pickup_starts_at timestamptz not null default now(),
  pickup_ends_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'collected', 'cancelled')),
  claimed_by uuid references public.profiles (id) on delete set null,
  claimed_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_listings_pickup_window check (pickup_starts_at < pickup_ends_at),
  constraint food_listings_expiry check (expires_at >= pickup_ends_at),
  constraint food_listings_claim_state check (
    (status = 'available' and claimed_by is null and claimed_at is null and collected_at is null)
    or (status = 'reserved' and claimed_by is not null and claimed_at is not null and collected_at is null)
    or (status = 'collected' and claimed_at is not null and collected_at is not null)
    or status = 'cancelled'
  )
);

create function public.anonymize_profile_pickups()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.food_listings
  set status = 'cancelled',
      claimed_by = null,
      claimed_at = null
  where claimed_by = old.id and status = 'reserved';

  update public.food_listings
  set claimed_by = null
  where claimed_by = old.id and status = 'collected';

  return old;
end;
$$;

create trigger profiles_anonymize_pickups
before delete on public.profiles
for each row execute function public.anonymize_profile_pickups();

create function public.set_food_listing_provider_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(nullif(trim(p.organization_name), ''), p.full_name)
  into new.provider_name
  from public.profiles p
  where p.id = new.posted_by and p.account_type = 'provider';

  if not found then
    raise exception 'Only food provider accounts can create listings';
  end if;

  return new;
end;
$$;

create trigger food_listings_set_provider_name
before insert on public.food_listings
for each row execute function public.set_food_listing_provider_name();

create index food_listings_available_expiry_idx
  on public.food_listings (expires_at)
  where status = 'available';
create index food_listings_posted_by_idx on public.food_listings (posted_by);
create index food_listings_claimed_by_idx on public.food_listings (claimed_by);
create index food_listings_location_idx
  on public.food_listings
  using gist (extensions.st_setsrid(extensions.st_makepoint(pickup_longitude, pickup_latitude), 4326)::extensions.geography);

create trigger food_listings_set_updated_at
before update on public.food_listings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.food_listings enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, organization_name, phone) on public.profiles to authenticated;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke all on public.food_listings from anon, authenticated;
grant select, insert on public.food_listings to authenticated;
grant update (
  title,
  description,
  category,
  quantity,
  unit,
  image_url,
  pickup_address,
  pickup_latitude,
  pickup_longitude,
  pickup_starts_at,
  pickup_ends_at,
  expires_at
) on public.food_listings to authenticated;

create policy "Farmers can view live offers and users can view their own"
on public.food_listings for select
to authenticated
using (
  posted_by = (select auth.uid())
  or claimed_by = (select auth.uid())
  or (
    status = 'available'
    and expires_at > now()
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.account_type = 'farmer'
    )
  )
);

create policy "Providers can create their own offers"
on public.food_listings for insert
to authenticated
with check (
  posted_by = (select auth.uid())
  and status = 'available'
  and claimed_by is null
  and claimed_at is null
  and collected_at is null
  and expires_at > now()
  and pickup_ends_at > now()
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_type = 'provider'
  )
);

create policy "Providers can edit their own available offers"
on public.food_listings for update
to authenticated
using (
  posted_by = (select auth.uid())
  and status = 'available'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_type = 'provider'
  )
)
with check (
  posted_by = (select auth.uid())
  and status = 'available'
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_type = 'provider'
  )
);

create function public.claim_food_listing(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  claiming_user uuid := auth.uid();
begin
  if claiming_user is null or not exists (
    select 1 from public.profiles
    where id = claiming_user and account_type = 'farmer'
  ) then
    raise exception 'Only signed-in farmer accounts can claim food';
  end if;

  update public.food_listings
  set status = 'reserved',
      claimed_by = claiming_user,
      claimed_at = now()
  where id = p_listing_id
    and status = 'available'
    and expires_at > now()
    and pickup_ends_at > now();

  if not found then
    raise exception 'This food listing is no longer available';
  end if;

  return p_listing_id;
end;
$$;

create function public.complete_food_pickup(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  completing_user uuid := auth.uid();
begin
  if completing_user is null or not exists (
    select 1 from public.profiles
    where id = completing_user and account_type = 'farmer'
  ) then
    raise exception 'Only signed-in farmer accounts can complete a pickup';
  end if;

  update public.food_listings
  set status = 'collected',
      collected_at = now()
  where id = p_listing_id
    and status = 'reserved'
    and claimed_by = completing_user
    and expires_at > now()
    and pickup_ends_at > now();

  if not found then
    raise exception 'This listing is not reserved by your account';
  end if;

  return p_listing_id;
end;
$$;

create function public.cancel_food_listing(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  cancelling_user uuid := auth.uid();
begin
  if cancelling_user is null or not exists (
    select 1 from public.profiles
    where id = cancelling_user and account_type = 'provider'
  ) then
    raise exception 'Only signed-in provider accounts can cancel listings';
  end if;

  update public.food_listings
  set status = 'cancelled'
  where id = p_listing_id
    and posted_by = cancelling_user
    and status = 'available';

  if not found then
    raise exception 'This listing cannot be cancelled';
  end if;

  return p_listing_id;
end;
$$;

revoke all on function public.claim_food_listing(uuid) from public, anon;
revoke all on function public.complete_food_pickup(uuid) from public, anon;
revoke all on function public.cancel_food_listing(uuid) from public, anon;
grant execute on function public.claim_food_listing(uuid) to authenticated;
grant execute on function public.complete_food_pickup(uuid) to authenticated;
grant execute on function public.cancel_food_listing(uuid) to authenticated;
