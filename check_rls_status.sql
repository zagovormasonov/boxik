-- Проверяем текущее состояние RLS для таблицы test_results

-- 1. Проверяем, включен ли RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'test_results';

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
WHERE tablename = 'test_results';

-- 3. Проверяем права доступа
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'test_results';

-- 4. Тестируем простой запрос
SELECT COUNT(*) as test_query_result FROM test_results;
