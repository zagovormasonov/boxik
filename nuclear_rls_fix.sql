-- Ядерное исправление RLS - полностью отключаем для всех таблиц
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Отключаем RLS для всех связанных таблиц
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_user_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем ВСЕ политики для test_results
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

-- 3. Удаляем ВСЕ политики для test_user_mapping
DROP POLICY IF EXISTS "Enable read access for all users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable insert for all users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable update for all users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable delete for all users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON test_user_mapping;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON test_user_mapping;

-- 4. Удаляем ВСЕ политики для users
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON users;

-- 5. Настраиваем права доступа для всех ролей
GRANT ALL ON test_results TO anon;
GRANT ALL ON test_results TO authenticated;
GRANT ALL ON test_results TO service_role;

GRANT ALL ON test_user_mapping TO anon;
GRANT ALL ON test_user_mapping TO authenticated;
GRANT ALL ON test_user_mapping TO service_role;

GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- 6. Проверяем статус RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('test_results', 'test_user_mapping', 'users');

-- 7. Проверяем, что нет политик
SELECT 
    schemaname, 
    tablename, 
    policyname 
FROM pg_policies 
WHERE tablename IN ('test_results', 'test_user_mapping', 'users');

-- 8. Тестируем доступ
SELECT COUNT(*) as test_results_count FROM test_results;
SELECT COUNT(*) as test_user_mapping_count FROM test_user_mapping;
SELECT COUNT(*) as users_count FROM users;

-- 9. Тестируем конкретный запрос пользователя
SELECT * FROM test_results 
WHERE user_id = '8e83a840-baa2-4b04-b9fa-28aad7332131'
ORDER BY completed_at DESC 
LIMIT 1;
