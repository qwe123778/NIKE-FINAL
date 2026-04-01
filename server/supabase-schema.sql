-- ═══════════════════════════════════════════════════════════════════════════
--  Nike Commerce Hub — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Users ──────────────────────────────────────────────────────────────────
-- Mirrors Clerk users so we can store extra data (role, etc.)
create table if not exists users (
  id          text primary key,           -- Clerk user ID
  email       text not null,
  name        text,
  role        text not null default 'buyer' check (role in ('buyer','seller')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Products ───────────────────────────────────────────────────────────────
create table if not exists products (
  id          text primary key default gen_random_uuid()::text,
  name        text        not null,
  category    text        not null,
  price       numeric     not null,
  sku         text        not null,
  image_url   text        not null,
  sizes       jsonb       not null default '[]',
  weight      text        default 'N/A',
  "offset"    text        default 'N/A',
  description text        not null default '',
  is_new      boolean     default false,
  seller_id   text        references users(id) on delete set null,
  created_at  timestamptz default now()
);

-- ── Orders ─────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                        text primary key default gen_random_uuid()::text,
  user_id                   text        not null references users(id) on delete cascade,
  total                     numeric     not null,
  status                    text        not null default 'processing'
                              check (status in ('processing','paid','shipped','delivered','failed','refunded')),
  shipping_address          jsonb,
  stripe_payment_intent_id  text unique,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);

-- ── Order Items ────────────────────────────────────────────────────────────
create table if not exists order_items (
  id          text primary key default gen_random_uuid()::text,
  order_id    text        not null references orders(id) on delete cascade,
  product_id  text,
  name        text        not null,
  size        numeric     not null,
  quantity    int         not null default 1,
  price       numeric     not null,
  image       text        default ''
);

-- ═══════════════════════════════════════════════════════════════════════════
--  Row Level Security
--  Products are public-read; users/orders are auth-only via service role.
--  Since our Express server uses the service role key, RLS won't block it.
--  We still enable RLS to block direct client-side DB access.
-- ═══════════════════════════════════════════════════════════════════════════
alter table products    enable row level security;
alter table users       enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Anyone can read products (public storefront)
create policy "Public read products"
  on products for select using (true);

-- ── Seed Data ──────────────────────────────────────────────────────────────
-- Replace image_url values with your actual hosted image URLs.
-- You can upload the assets/ images to Supabase Storage or any CDN.
insert into products (name, category, price, sku, image_url, sizes, weight, "offset", description, is_new)
values
  ('Air Zoom Alpha',  'Running',    275, 'NK-884-01', '/placeholder.svg', '[7,7.5,8,8.5,9,9.5,10,10.5,11,12]', '240g', '10mm', 'Engineered for explosive speed. Carbon fiber plate and responsive ZoomX foam.', true),
  ('Court Force Pro', 'Basketball', 220, 'NK-291-05', '/placeholder.svg', '[8,8.5,9,9.5,10,10.5,11,12,13]',     '380g', '12mm', 'Dominate the court with responsive cushioning and a locked-in fit.',           false),
  ('Terra Trail X',   'Trail',      195, 'NK-447-03', '/placeholder.svg', '[7,8,8.5,9,9.5,10,10.5,11]',         '310g',  '8mm', 'Aggressive lug pattern for maximum grip on technical terrain.',               true),
  ('Phantom React',   'Running',    185, 'NK-662-08', '/placeholder.svg', '[7,7.5,8,8.5,9,9.5,10,11]',          '260g', '10mm', 'Smooth transitions and plush comfort for daily training miles.',               false),
  ('Hyperdunk Elite', 'Basketball', 310, 'NK-119-02', '/placeholder.svg', '[8,9,9.5,10,10.5,11,12,13,14]',      '410g', '14mm', 'Stadium-ready performance. Full-length Zoom Air with Flywire cables.',          true),
  ('Daybreak Retro',  'Lifestyle',  145, 'NK-773-11', '/placeholder.svg', '[6,7,7.5,8,8.5,9,9.5,10,10.5,11]',  '220g',  '9mm', 'Heritage design meets modern comfort.',                                       false)
on conflict do nothing;
