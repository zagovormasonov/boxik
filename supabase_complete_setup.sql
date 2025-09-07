-- Полный SQL скрипт для настройки Supabase с нуля
-- Выполните эти команды в Supabase SQL Editor

-- ==============================================
-- 1. СОЗДАНИЕ ТАБЛИЦ
-- ==============================================

-- Таблица пользователей
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  yandex_id VARCHAR(255),
  yandex_login VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Таблица результатов тестов
CREATE TABLE test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers INTEGER[] NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. СОЗДАНИЕ ИНДЕКСОВ
-- ==============================================

-- Индексы для таблицы users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Индексы для таблицы test_results
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at DESC);
CREATE INDEX idx_test_results_score ON test_results(score DESC);

-- ==============================================
-- 3. СОЗДАНИЕ ТРИГГЕРОВ
-- ==============================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в таблице users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 4. НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Включаем RLS для обеих таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики (если есть)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can upsert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own test results" ON test_results;
DROP POLICY IF EXISTS "Users can insert own test results" ON test_results;

-- Политики для таблицы users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Политика для upsert (обновление или создание)
CREATE POLICY "Users can upsert own profile" ON users
    FOR ALL USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Политики для таблицы test_results
CREATE POLICY "Users can view own test results" ON test_results
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own test results" ON test_results
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ==============================================
-- 5. ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
-- ==============================================

-- Функция для получения статистики пользователя
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_tests INTEGER,
  average_score NUMERIC,
  best_score INTEGER,
  last_test_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_tests,
    ROUND(AVG(score::NUMERIC), 2) as average_score,
    MAX(score)::INTEGER as best_score,
    MAX(completed_at) as last_test_date
  FROM test_results 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения топ результатов
CREATE OR REPLACE FUNCTION get_top_results(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_name VARCHAR(255),
  score INTEGER,
  total_questions INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.name,
    tr.score,
    tr.total_questions,
    tr.completed_at
  FROM test_results tr
  JOIN users u ON tr.user_id = u.id
  ORDER BY tr.score DESC, tr.completed_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 6. ПРОВЕРКА УСТАНОВКИ
-- ==============================================

-- Проверяем что таблицы созданы
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'test_results')
ORDER BY tablename;

-- Проверяем что политики созданы
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE tablename IN ('users', 'test_results')
ORDER BY tablename, policyname;

-- Проверяем что индексы созданы
SELECT 
  indexname, 
  tablename, 
  indexdef 
FROM pg_indexes 
WHERE tablename IN ('users', 'test_results')
ORDER BY tablename, indexname;

-- ==============================================
-- 7. ТЕСТОВЫЕ ДАННЫЕ (ОПЦИОНАЛЬНО)
-- ==============================================

-- Раскомментируйте для создания тестовых данных
/*
-- Тестовый пользователь
INSERT INTO users (id, email, name, avatar_url) VALUES 
('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Тестовый пользователь', 'https://example.com/avatar.jpg');

-- Тестовые результаты
INSERT INTO test_results (user_id, score, total_questions, answers) VALUES 
('00000000-0000-0000-0000-000000000001', 4, 5, ARRAY[0,1,1,0,1]),
('00000000-0000-0000-0000-000000000001', 5, 5, ARRAY[1,1,1,1,1]);
*/

-- ==============================================
-- ГОТОВО!
-- ==============================================

-- После выполнения этого скрипта:
-- 1. Таблицы users и test_results будут созданы
-- 2. RLS политики будут настроены
-- 3. Индексы будут созданы для производительности
-- 4. Триггеры будут работать для автоматического обновления
-- 5. Дополнительные функции будут доступны

-- Проверьте результат выполнения в логах Supabase
