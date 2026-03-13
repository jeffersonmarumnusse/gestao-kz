-- Tabela de Alunos
CREATE TABLE students (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT,
  last_checkin TEXT DEFAULT 'Nunca',
  status TEXT,
  value DECIMAL(10, 2),
  preferred_time TEXT,
  preferred_modality TEXT,
  enrollment_date DATE,
  preferred_due_day TEXT,
  birth_date DATE,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Alunos Experimentais
CREATE TABLE experimental_students (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  preferred_time TEXT,
  preferred_modality TEXT,
  enrollment_date DATE,
  birth_date DATE,
  phone TEXT,
  status TEXT DEFAULT 'Experimental',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Transações
CREATE TABLE transactions (
  id BIGINT PRIMARY KEY,
  student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'in' ou 'out'
  status TEXT NOT NULL, -- 'completed' ou 'pending'
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Agendamentos (Flatter version for better DB structure)
CREATE TABLE agenda_bookings (
  id TEXT PRIMARY KEY, -- Usando o timestamp como ID para manter consistência com o front
  slot_key TEXT NOT NULL, -- Formato: "YYYY-MM-DD-HH:MM"
  modality TEXT NOT NULL,
  student_name TEXT NOT NULL,
  is_experimental BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Opcional, mas recomendado. Para este projeto, manteremos simples por enquanto)
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir acesso total para anon" ON students FOR ALL USING (true);
-- Repetir para as outras tabelas se desejar.
