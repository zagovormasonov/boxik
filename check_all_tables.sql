-- Проверяем состояние всех таблиц
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Проверяем статус RLS для всех таблиц
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('test_results', 'test_user_mapping', 'users', 'subscriptions')
ORDER BY tablename;

-- 2. Проверяем все политики
SELECT 
    schemaname, 
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('test_results', 'test_user_mapping', 'users', 'subscriptions')
ORDER BY tablename, policyname;

-- 3. Проверяем права доступа
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name IN ('test_results', 'test_user_mapping', 'users', 'subscriptions')
ORDER BY table_name, grantee, privilege_type;

-- 4. Тестируем простые запросы
SELECT 'test_results' as table_name, COUNT(*) as count FROM test_results
UNION ALL
SELECT 'test_user_mapping' as table_name, COUNT(*) as count FROM test_user_mapping
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'subscriptions' as table_name, COUNT(*) as count FROM subscriptions;

-- 5. Тестируем запрос с фильтром по user_id
SELECT COUNT(*) as user_test_results_count 
FROM test_results 
WHERE user_id = '8e83a840-baa2-4b04-b9fa-28aad7332131';

-- 6. Проверяем структуру таблиц
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('test_results', 'test_user_mapping', 'users', 'subscriptions')
ORDER BY table_name, ordinal_position;
