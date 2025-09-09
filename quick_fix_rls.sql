-- Быстрое исправление RLS для таблицы test_results
-- Выполните этот скрипт в Supabase SQL Editor

-- Отключаем RLS
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- Удаляем все политики
DROP POLICY IF EXISTS "Enable read access for all users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for all users" ON test_results;
DROP POLICY IF EXISTS "Enable update for all users" ON test_results;
DROP POLICY IF EXISTS "Enable delete for all users" ON test_results;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON test_results;

-- Создаем простые политики
CREATE POLICY "Allow all operations for authenticated users" ON test_results
    FOR ALL USING (auth.role() = 'authenticated');

-- Включаем RLS обратно
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT COUNT(*) as total_test_results FROM test_results;
