-- Проверяем текущее состояние RLS и прав доступа

-- 1. Проверяем статус RLS
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

-- 5. Тестируем запрос с фильтром по user_id
SELECT COUNT(*) as user_query_result 
FROM test_results 
WHERE user_id = '4f65b376-11a6-4a73-90eb-b5c3328cce22';

-- 6. Проверяем, есть ли данные в таблице
SELECT 
    id,
    user_id,
    test_type,
    score,
    grade,
    completed_at
FROM test_results 
LIMIT 5;
