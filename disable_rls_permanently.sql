-- Полностью отключаем RLS для таблицы test_results
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Полностью отключаем RLS
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем ВСЕ политики
DROP POLICY IF EXISTS "Enable read access for all users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for all users" ON test_results;
DROP POLICY IF EXISTS "Enable update for all users" ON test_results;
DROP POLICY IF EXISTS "Enable delete for all users" ON test_results;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON test_results;
DROP POLICY IF EXISTS "test_results_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_select_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_insert_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_update_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_delete_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_read_policy" ON test_results;

-- 3. Проверяем, что RLS отключен
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'test_results';

-- 4. Проверяем, что нет политик
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'test_results';

-- 5. Тестируем доступ (должен работать без ошибок)
SELECT COUNT(*) as test_count FROM test_results;

-- 6. Тестируем конкретный запрос пользователя
SELECT * FROM test_results 
WHERE user_id = '4f65b376-11a6-4a73-90eb-b5c3328cce22'
ORDER BY completed_at DESC 
LIMIT 1;

-- 7. Проверяем права доступа для анонимных пользователей
GRANT SELECT ON test_results TO anon;
GRANT INSERT ON test_results TO anon;
GRANT UPDATE ON test_results TO anon;
GRANT DELETE ON test_results TO anon;

-- 8. Проверяем права доступа для аутентифицированных пользователей
GRANT SELECT ON test_results TO authenticated;
GRANT INSERT ON test_results TO authenticated;
GRANT UPDATE ON test_results TO authenticated;
GRANT DELETE ON test_results TO authenticated;

-- 9. Финальная проверка
SELECT COUNT(*) as final_test_count FROM test_results;
