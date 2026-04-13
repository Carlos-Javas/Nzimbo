
-- ═══════════════════════════════════════════════════════════
--   IMPORTANTE: DESATIVAR CONFIRMAÇÃO DE EMAIL
-- ═══════════════════════════════════════════════════════════
-- Para que os utilizadores consigam entrar sem confirmar email:
-- 1. Vai ao Supabase Dashboard → Authentication → Settings
-- 2. Desativa "Enable email confirmations" 
-- 3. Ou mantém ativo para segurança (recomendado em produção)
--
-- Para emails reais de reset de password:
-- 1. Vai ao Supabase Dashboard → Authentication → Settings → SMTP
-- 2. Configura o teu servidor SMTP (Gmail, SendGrid, etc.)
-- 3. Ou usa o SMTP padrão do Supabase (limitado a 3 emails/hora)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
--   NZIMBO — SUPABASE DATABASE SCHEMA
--   Cole este SQL no Editor SQL do Supabase e executa tudo
-- ═══════════════════════════════════════════════════════════

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ── PROFILES (perfis de utilizadores) ─────────────────────
create table if not exists profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  first_name    text not null default '',
  last_name     text default '',
  phone         text default '',
  type          text not null default 'buyer' check (type in ('buyer','creator')),
  avatar_url    text default '',
  city          text default '',
  bio           text default '',
  storage_used  bigint not null default 0,         -- bytes usados
  storage_limit bigint not null default 6442450944, -- 6 GB em bytes
  plan          text not null default 'free' check (plan in ('free','basic','pro')),
  is_approved   boolean default true,  -- criadores precisam aprovação
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── COURSES ────────────────────────────────────────────────
create table if not exists courses (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid references profiles(id) on delete cascade not null,
  title            text not null,
  description      text default '',
  category         text default 'Geral',
  level            text default 'Iniciante',
  price            numeric(12,2) default 0,
  old_price        numeric(12,2) default 0,
  status           text default 'draft' check (status in ('draft','published','archived')),
  thumbnail_url    text default '',
  total_lessons    int default 0,
  total_duration   text default '',
  rating           numeric(3,2) default 0,
  students_count   int default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── MODULES ───────────────────────────────────────────────
create table if not exists modules (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  title     text not null,
  position  int default 0,
  created_at timestamptz default now()
);

-- ── LESSONS ───────────────────────────────────────────────
create table if not exists lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid references modules(id) on delete cascade not null,
  course_id   uuid references courses(id) on delete cascade not null,
  title       text not null,
  duration    text default '',
  video_url   text default '',
  is_free     boolean default false,
  position    int default 0,
  file_size   bigint default 0,
  created_at  timestamptz default now()
);

-- ── PRODUCTS ──────────────────────────────────────────────
create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid references profiles(id) on delete cascade not null,
  title            text not null,
  description      text default '',
  category         text default 'Geral',
  type             text default 'ebook' check (type in ('ebook','template','software','audio','outro')),
  price            numeric(12,2) default 0,
  old_price        numeric(12,2) default 0,
  status           text default 'draft' check (status in ('draft','published','archived')),
  thumbnail_url    text default '',
  file_url         text default '',
  file_size        bigint default 0,
  downloads_count  int default 0,
  rating           numeric(3,2) default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── ENROLLMENTS ───────────────────────────────────────────
create table if not exists enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  course_id   uuid references courses(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  unique(user_id, course_id)
);

-- ── PROGRESS ──────────────────────────────────────────────
create table if not exists progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade not null,
  course_id    uuid references courses(id) on delete cascade not null,
  lesson_id    uuid references lessons(id) on delete cascade not null,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

-- ── PURCHASES ─────────────────────────────────────────────
create table if not exists purchases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) not null,
  course_id     uuid references courses(id),
  product_id    uuid references products(id),
  amount        numeric(12,2) default 0,
  method        text default 'Multicaixa',
  status        text default 'paid' check (status in ('paid','pending','refunded')),
  purchased_at  timestamptz default now()
);

-- ── WITHDRAWALS ───────────────────────────────────────────
create table if not exists withdrawals (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid references profiles(id) on delete cascade not null,
  amount          numeric(12,2) not null,
  method          text not null default 'multicaixa' check (method in ('unitel','multicaixa','banco')),
  method_details  jsonb default '{}',   -- {phone, bank, iban, holder}
  status          text default 'pending' check (status in ('pending','processing','completed','rejected')),
  notes           text default '',
  requested_at    timestamptz default now(),
  processed_at    timestamptz
);

-- ── RATINGS ───────────────────────────────────────────────
create table if not exists ratings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) not null,
  course_id  uuid references courses(id),
  product_id uuid references products(id),
  rating     int check (rating between 1 and 5),
  comment    text default '',
  created_at timestamptz default now(),
  unique(user_id, course_id),
  unique(user_id, product_id)
);

-- ── WISHLIST ──────────────────────────────────────────────
create table if not exists wishlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade not null,
  course_id  uuid references courses(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  added_at   timestamptz default now()
);

-- ── NOTES ─────────────────────────────────────────────────
create table if not exists notes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  content   text default '',
  updated_at timestamptz default now(),
  unique(user_id, course_id)
);

-- ═══════════════════════════════════════════════════════════
--   ROW LEVEL SECURITY (cada user só vê os seus dados)
-- ═══════════════════════════════════════════════════════════

alter table profiles     enable row level security;
alter table courses      enable row level security;
alter table modules      enable row level security;
alter table lessons      enable row level security;
alter table products     enable row level security;
alter table enrollments  enable row level security;
alter table progress     enable row level security;
alter table purchases    enable row level security;
alter table ratings      enable row level security;
alter table wishlist     enable row level security;
alter table notes        enable row level security;

-- Profiles: cada um vê/edita o seu
create policy "profiles_own" on profiles for all using (auth.uid() = id);

-- Courses: criadores gerem os seus; todos lêem publicados
create policy "courses_read_published" on courses for select using (status = 'published' or creator_id = auth.uid());
create policy "courses_creator_write"  on courses for all  using (creator_id = auth.uid());

-- Modules/Lessons: criadores editam; compradores inscritos lêem
create policy "modules_read"  on modules for select using (
  exists (select 1 from courses c where c.id = modules.course_id and (c.status='published' or c.creator_id=auth.uid()))
);
create policy "modules_write" on modules for all using (
  exists (select 1 from courses c where c.id = modules.course_id and c.creator_id = auth.uid())
);
create policy "lessons_read"  on lessons for select using (
  is_free = true or
  exists (select 1 from enrollments e where e.course_id = lessons.course_id and e.user_id = auth.uid()) or
  exists (select 1 from courses c where c.id = lessons.course_id and c.creator_id = auth.uid())
);
create policy "lessons_write" on lessons for all using (
  exists (select 1 from courses c where c.id = lessons.course_id and c.creator_id = auth.uid())
);

-- Products: criadores editam; todos lêem publicados
create policy "products_read_published" on products for select using (status = 'published' or creator_id = auth.uid());
create policy "products_creator_write"  on products for all  using (creator_id = auth.uid());

-- Enrollments: próprias inscrições
create policy "enrollments_own" on enrollments for all using (user_id = auth.uid());

-- Progress: próprio progresso
create policy "progress_own" on progress for all using (user_id = auth.uid());

-- Purchases: próprias compras
create policy "purchases_own" on purchases for all using (user_id = auth.uid());

-- Ratings: próprias avaliações
create policy "ratings_write_own" on ratings for all using (user_id = auth.uid());
create policy "ratings_read_all"  on ratings for select using (true);

-- Wishlist/Notes: próprios
create policy "wishlist_own" on wishlist for all using (user_id = auth.uid());
create policy "notes_own"    on notes    for all using (user_id = auth.uid());

-- Withdrawals: apenas o criador vê e cria os seus pedidos
alter table withdrawals enable row level security;
create policy "withdrawals_own" on withdrawals for all using (creator_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
--   TRIGGER: criar perfil automaticamente após registo
-- ═══════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'type', 'buyer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════
--   TRIGGER: atualizar storage_used ao upload/delete
-- ═══════════════════════════════════════════════════════════
create or replace function update_course_stats()
returns trigger language plpgsql as $$
begin
  update courses set
    total_lessons = (select count(*) from lessons where course_id = new.course_id),
    updated_at = now()
  where id = new.course_id;
  return new;
end;
$$;
create trigger after_lesson_change
  after insert or delete on lessons
  for each row execute procedure update_course_stats();

-- ═══════════════════════════════════════════════════════════
--   VIEWS úteis (opcional)
-- ═══════════════════════════════════════════════════════════
create or replace view public_stats as
  select
    (select count(*) from profiles) as total_users,
    (select count(*) from profiles where type = 'creator') as total_creators,
    (select count(*) from courses where status = 'published') as total_courses,
    (select count(*) from products where status = 'published') as total_products,
    (select count(*) from enrollments) as total_enrollments;

-- ═══════════════════════════════════════════════════════════
--   STORAGE BUCKETS (criar no Dashboard > Storage)
-- ═══════════════════════════════════════════════════════════
-- Criar os buckets seguintes no Dashboard do Supabase:
--   1. "course-thumbnails"  (public: true)
--   2. "course-videos"      (public: false)
--   3. "product-files"      (public: false)
--   4. "product-thumbnails" (public: true)
--   5. "avatars"            (public: true)
