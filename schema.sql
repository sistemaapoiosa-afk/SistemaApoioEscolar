-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Escola (Settings)
create table "Escola" (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'Escola Modelo',
  "hasNightShift" boolean default true,
  "lunchColor" text default '#f97316',
  "availableWeeks" integer default 2,
  "semanticColors" jsonb default '{"regular": "#2563eb", "maintenance": "#dc2626", "specialEvent": "#9333ea", "blockedProject": "#d97706"}'::jsonb,
  logo_url text,
  "logoUrl" text, -- Legacy/Duplicate handling seen in code
  academic_config jsonb,
  session_timeouts jsonb
);

-- 2. ConfiguracaoLogin (Public Config)
create table "ConfiguracaoLogin" (
  id uuid default uuid_generate_v4() primary key,
  escola_id uuid references "Escola"(id),
  titulo text,
  logo_url text,
  cores jsonb
);

-- 3. Profissionais (Staff/Teachers)
create table "Profissionais" (
  id uuid references auth.users not null primary key, -- Linked to Supabase Auth
  nome text not null,
  email text,
  foto text,
  tipo text check (tipo in ('Administrador', 'Coordenador', 'Professor', 'Colaborador')),
  alias text
);

-- 4. Recursos (Resources)
create table "Recursos" (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  details text,
  type text not null,
  "iconBg" text,
  "iconColor" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Turmas (Classes)
create table "Turmas" (
  id uuid default uuid_generate_v4() primary key,
  series text not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Disciplinas (Subjects)
create table "Disciplinas" (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. Horarios (Time Slots)
create table "Horarios" (
  id uuid default uuid_generate_v4() primary key,
  label text not null,
  start_time time not null,
  end_time time not null,
  type text check (type in ('class', 'interval')),
  position integer
);

-- 8. HorarioTurmas (Class Allocations)
create table "HorarioTurmas" (
  id uuid default uuid_generate_v4() primary key,
  turma_id uuid references "Turmas"(id) on delete cascade,
  professor_id uuid references "Profissionais"(id) on delete set null,
  disciplina_id uuid references "Disciplinas"(id) on delete set null,
  horario_id uuid references "Horarios"(id) on delete cascade,
  dia_semana integer not null, -- 0-6 or 1-5? Code suggests JS getDay() (0=Sun)
  ano_letivo text not null,
  semestre text not null,
  sala text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(turma_id, horario_id, dia_semana, ano_letivo, semestre)
);

-- 9. HorarioComplementar (Teacher Complementary Allocations)
create table "HorarioComplementar" (
  id uuid default uuid_generate_v4() primary key,
  professor_id uuid references "Profissionais"(id) on delete cascade,
  dia_semana integer not null,
  horario_id uuid references "Horarios"(id) on delete cascade,
  atividade text,
  ano_letivo text,
  semestre text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 10. CalendarioLetivo (Events)
create table "CalendarioLetivo" (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date date not null,
  type text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 11. Links (Portal Links)
create table "Links" (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  url text not null,
  icon text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 12. PreferenciasUsuario (User Preferences)
create table "PreferenciasUsuario" (
  user_id uuid references auth.users not null primary key,
  link_order jsonb,
  student_order jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 13. Alunos (Students)
create table "Alunos" (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  matricula text,
  turma_id uuid references "Turmas"(id) on delete set null,
  pdt_id uuid references "Profissionais"(id) on delete set null,
  status text,
  foto_url text,
  diagnostico text,
  pcd_dados jsonb, -- JSON for complex PCD profile
  anexos jsonb,    -- Array of attachments
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Storage Policies (Buckets must be created manually or via script, but policies can be hinted)
-- Bucket: 'avatars' (public)
-- Bucket: 'logos' (public)
-- Bucket: 'attachments' (private/authenticated?)

-- RLS Policies (Basic examples - User should refine)
alter table "Escola" enable row level security;
create policy "Public Read Escola" on "Escola" for select using (true);
create policy "Admin Update Escola" on "Escola" for update using (auth.role() = 'authenticated'); -- Simplification

alter table "Profissionais" enable row level security;
create policy "Public Read Profissionais" on "Profissionais" for select using (true);

-- ... (Add more RLS as needed, but for now this schema allows the app to run)
