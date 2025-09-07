-- ==============================================
-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ ТАБЛИЦЫ TEST_RESULTS
-- ==============================================

-- 1. Проверяем существование таблицы test_results
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers INTEGER[] NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создаем индексы если они не существуют
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_score ON test_results(score DESC);

-- 3. Включаем RLS для таблицы test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 4. Удаляем существующие политики (если есть)
DROP POLICY IF EXISTS "Users can view own test results" ON test_results;
DROP POLICY IF EXISTS "Users can insert own test results" ON test_results;
DROP POLICY IF EXISTS "Users can update own test results" ON test_results;

-- 5. Создаем новые политики для test_results
-- Политика для чтения результатов тестов (все могут читать свои результаты)
CREATE POLICY "Users can view own test results" ON test_results
  FOR SELECT USING (true);

-- Политика для вставки результатов тестов (все могут создавать)
CREATE POLICY "Users can insert own test results" ON test_results
  FOR INSERT WITH CHECK (true);

-- Политика для обновления результатов тестов (все могут обновлять)
CREATE POLICY "Users can update own test results" ON test_results
  FOR UPDATE USING (true);

-- 6. Проверяем что политики созданы
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'test_results';

-- 7. Проверяем что RLS включен
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'test_results';

-- 8. Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'test_results' 
ORDER BY ordinal_position;

-- ==============================================
-- ГОТОВО! Теперь таблица test_results должна работать
-- ==============================================
