-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

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
  alias text,
  must_change_password boolean default false
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

-- RLS Policies
-- ==============================================================================

-- 1. Enable RLS on all tables
alter table "Escola" enable row level security;
alter table "ConfiguracaoLogin" enable row level security;
alter table "Profissionais" enable row level security;
alter table "Recursos" enable row level security;
alter table "Turmas" enable row level security;
alter table "Disciplinas" enable row level security;
alter table "Horarios" enable row level security;
alter table "HorarioTurmas" enable row level security;
alter table "HorarioComplementar" enable row level security;
alter table "CalendarioLetivo" enable row level security;
alter table "Links" enable row level security;
alter table "PreferenciasUsuario" enable row level security;
alter table "Alunos" enable row level security;

-- 2. Define Policies

-- GROUP A: Public Read / Authenticated Write
-- Tables: Escola, ConfiguracaoLogin, Profissionais, Recursos, Turmas, Disciplinas, 
--         Horarios, HorarioTurmas, HorarioComplementar, CalendarioLetivo, Links

-- Escola
create policy "Public Read Escola" on "Escola" for select using (true);
create policy "Auth All Escola" on "Escola" for all using (auth.role() = 'authenticated');

-- ConfiguracaoLogin
create policy "Public Read ConfiguracaoLogin" on "ConfiguracaoLogin" for select using (true);
create policy "Auth All ConfiguracaoLogin" on "ConfiguracaoLogin" for all using (auth.role() = 'authenticated');

-- Profissionais (Public read needed for schedules/directory)
create policy "Public Read Profissionais" on "Profissionais" for select using (true);
create policy "Auth All Profissionais" on "Profissionais" for all using (auth.role() = 'authenticated');

-- Recursos
create policy "Public Read Recursos" on "Recursos" for select using (true);
create policy "Auth All Recursos" on "Recursos" for all using (auth.role() = 'authenticated');

-- Turmas
create policy "Public Read Turmas" on "Turmas" for select using (true);
create policy "Auth All Turmas" on "Turmas" for all using (auth.role() = 'authenticated');

-- Disciplinas
create policy "Public Read Disciplinas" on "Disciplinas" for select using (true);
create policy "Auth All Disciplinas" on "Disciplinas" for all using (auth.role() = 'authenticated');

-- Horarios
create policy "Public Read Horarios" on "Horarios" for select using (true);
create policy "Auth All Horarios" on "Horarios" for all using (auth.role() = 'authenticated');

-- HorarioTurmas
create policy "Public Read HorarioTurmas" on "HorarioTurmas" for select using (true);
create policy "Auth All HorarioTurmas" on "HorarioTurmas" for all using (auth.role() = 'authenticated');

-- HorarioComplementar
create policy "Public Read HorarioComplementar" on "HorarioComplementar" for select using (true);
create policy "Auth All HorarioComplementar" on "HorarioComplementar" for all using (auth.role() = 'authenticated');

-- CalendarioLetivo
create policy "Public Read CalendarioLetivo" on "CalendarioLetivo" for select using (true);
create policy "Auth All CalendarioLetivo" on "CalendarioLetivo" for all using (auth.role() = 'authenticated');

-- Links
create policy "Public Read Links" on "Links" for select using (true);
create policy "Auth All Links" on "Links" for all using (auth.role() = 'authenticated');

-- GROUP B: Private / Sensitive Data
-- Tables: PreferenciasUsuario, Alunos

-- PreferenciasUsuario (Owner Access Only)
create policy "User View Own Prefs" on "PreferenciasUsuario" for select using (auth.uid() = user_id);
create policy "User Update Own Prefs" on "PreferenciasUsuario" for update using (auth.uid() = user_id);
create policy "User Insert Own Prefs" on "PreferenciasUsuario" for insert with check (auth.uid() = user_id);
create policy "User Delete Own Prefs" on "PreferenciasUsuario" for delete using (auth.uid() = user_id);

-- Alunos (Authenticated Users Only - Staff/Teachers)
-- Students data is sensitive, should not be public.
create policy "Auth Read Alunos" on "Alunos" for select using (auth.role() = 'authenticated');
create policy "Auth All Alunos" on "Alunos" for all using (auth.role() = 'authenticated');

-- 3. Seed Initial Admin User
-- ==============================================================================
DO $$
DECLARE
  -- ===========================================================================
  -- CONFIGURAÇÃO DO PRIMEIRO USUÁRIO (ADMIN)
  -- Edite as variáveis abaixo antes de executar o script.
  -- ===========================================================================
  v_admin_email text := 'admin@escola.com';  -- ⚠️ COLOQUE SEU EMAIL AQUI
  v_admin_pass  text := '123456';            -- ⚠️ COLOQUE SUA SENHA AQUI
  
  -- Variáveis internas (não precisa mexer)
  new_id uuid := uuid_generate_v4();
BEGIN
  -- Check if admin already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_admin_email) THEN
    
    -- 1. Insert into auth.users (Supabase Auth)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) VALUES (
      new_id,
      '00000000-0000-0000-0000-000000000000',
      v_admin_email,
      crypt(v_admin_pass, gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      'authenticated',
      'authenticated',
      ''
    );

    -- 2. Insert into public.Profissionais
    INSERT INTO public."Profissionais" (id, nome, email, tipo, must_change_password)
    VALUES (new_id, 'Administrador', v_admin_email, 'Administrador', true);
    
    RAISE NOTICE 'Usuário Admin criado com sucesso: %', v_admin_email;
  ELSE
    RAISE NOTICE 'O usuário Admin (%) já existe. Nada foi feito.', v_admin_email;
  END IF;
END $$;
