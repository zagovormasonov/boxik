-- ==============================================
-- БЫСТРОЕ ИСПРАВЛЕНИЕ RLS ДЛЯ TEST_RESULTS
-- ==============================================

-- ВРЕМЕННО ОТКЛЮЧАЕМ RLS для разработки
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- Проверяем что RLS отключен
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'test_results';

-- Проверяем что таблица существует и доступна
SELECT COUNT(*) as test_results_count FROM test_results;

-- Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'test_results' 
ORDER BY ordinal_position;

-- ==============================================
-- ГОТОВО! Теперь таблица test_results доступна для всех операций
-- ==============================================
