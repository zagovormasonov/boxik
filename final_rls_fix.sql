-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ RLS ДЛЯ ВСЕХ ТАБЛИЦ
-- Этот скрипт полностью исправляет проблемы с доступом к таблицам

-- 1. ОТКЛЮЧАЕМ RLS ДЛЯ ВСЕХ ТАБЛИЦ
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_user_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ ВСЕ СУЩЕСТВУЮЩИЕ ПОЛИТИКИ
DROP POLICY IF EXISTS "test_results_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_select_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_insert_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_update_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_delete_policy" ON test_results;

DROP POLICY IF EXISTS "test_user_mapping_policy" ON test_user_mapping;
DROP POLICY IF EXISTS "test_user_mapping_select_policy" ON test_user_mapping;
DROP POLICY IF EXISTS "test_user_mapping_insert_policy" ON test_user_mapping;
DROP POLICY IF EXISTS "test_user_mapping_update_policy" ON test_user_mapping;
DROP POLICY IF EXISTS "test_user_mapping_delete_policy" ON test_user_mapping;

DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 3. ПРЕДОСТАВЛЯЕМ ПОЛНЫЕ ПРАВА ВСЕМ РОЛЯМ
GRANT ALL ON test_results TO anon;
GRANT ALL ON test_results TO authenticated;
GRANT ALL ON test_results TO service_role;

GRANT ALL ON test_user_mapping TO anon;
GRANT ALL ON test_user_mapping TO authenticated;
GRANT ALL ON test_user_mapping TO service_role;

GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- 4. ПРЕДОСТАВЛЯЕМ ПРАВА НА ПОСЛЕДОВАТЕЛЬНОСТИ (ЕСЛИ ЕСТЬ)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('test_results', 'test_user_mapping', 'users')
ORDER BY tablename;

-- 6. ПРОВЕРЯЕМ ПРАВА ДОСТУПА
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('test_results', 'test_user_mapping', 'users')
ORDER BY table_name, grantee, privilege_type;

-- 7. ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА RLS СТАТУСА
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND c.relname IN ('test_results', 'test_user_mapping', 'users')
ORDER BY c.relname;
