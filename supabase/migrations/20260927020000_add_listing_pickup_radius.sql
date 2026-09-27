alter table public.food_listings
  add column pickup_radius_miles smallint not null default 25
    check (pickup_radius_miles in (5, 10, 25, 50, 100));
