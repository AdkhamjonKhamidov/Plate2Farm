do $$
begin
  if not exists (
    select 1
    from public.profiles
    where account_type = 'provider'
  ) then
    raise exception 'Create a provider account before loading sample listings.';
  end if;
end;
$$;

with provider as (
  select id
  from public.profiles
  where account_type = 'provider'
),
samples (
  title,
  description,
  category,
  quantity,
  unit,
  pickup_address,
  pickup_latitude,
  pickup_longitude,
  pickup_radius_miles
) as (
  values
    (
      'SAMPLE · Farm-fresh produce box',
      'Demo listing: a seasonal mix of fresh vegetables.',
      'produce',
      12,
      'boxes',
      'DEMO pickup point 1 · Columbus, OH',
      39.9612,
      -82.9988,
      25
    ),
    (
      'SAMPLE · Chilled dairy crate',
      'Demo listing: assorted dairy products ready for pickup.',
      'dairy',
      8,
      'boxes',
      'DEMO pickup point 2 · Columbus, OH',
      39.9890,
      -83.0080,
      10
    ),
    (
      'SAMPLE · Bakery surplus',
      'Demo listing: assorted bread and pastries from today.',
      'bakery',
      20,
      'bags',
      'DEMO pickup point 3 · Columbus, OH',
      39.9470,
      -82.9850,
      5
    ),
    (
      'SAMPLE · Rescued harvest bowls',
      'Demo listing: prepared grain bowls made with surplus seasonal produce.',
      'prepared',
      16,
      'meals',
      'DEMO pickup point 5 · Columbus, OH',
      39.9550,
      -83.0250,
      25
    ),
    (
      'SAMPLE · Pantry staples',
      'Demo listing: shelf-stable pantry items available locally.',
      'pantry',
      30,
      'items',
      'DEMO pickup point 4 · Columbus, OH',
      39.9730,
      -83.0400,
      50
    )
)
insert into public.food_listings (
  posted_by,
  provider_name,
  title,
  description,
  category,
  quantity,
  unit,
  pickup_address,
  pickup_latitude,
  pickup_longitude,
  pickup_radius_miles,
  pickup_starts_at,
  pickup_ends_at,
  expires_at
)
select
  provider.id,
  '',
  samples.title,
  samples.description,
  samples.category,
  samples.quantity,
  samples.unit,
  samples.pickup_address,
  samples.pickup_latitude,
  samples.pickup_longitude,
  samples.pickup_radius_miles,
  now() - interval '15 minutes',
  now() + interval '6 hours',
  now() + interval '6 hours'
from provider
cross join samples
where not exists (
  select 1
  from public.food_listings existing
  where existing.posted_by = provider.id
    and existing.title = samples.title
);
