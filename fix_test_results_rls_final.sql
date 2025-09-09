-- Исправление RLS для таблицы test_results
-- Этот скрипт исправляет проблемы с доступом к таблице test_results

-- 1. Проверяем текущее состояние RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'test_results';

-- 2. Проверяем существующие политики
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

-- 3. Временно отключаем RLS для исправления
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- 4. Удаляем все существующие политики
DROP POLICY IF EXISTS "Enable read access for all users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for all users" ON test_results;
DROP POLICY IF EXISTS "Enable update for all users" ON test_results;

-- 5. Создаем новую политику для чтения (все авторизованные пользователи)
CREATE POLICY "Enable read access for authenticated users" ON test_results
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Создаем политику для вставки (все авторизованные пользователи)
CREATE POLICY "Enable insert for authenticated users" ON test_results
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Создаем политику для обновления (все авторизованные пользователи)
CREATE POLICY "Enable update for authenticated users" ON test_results
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Включаем RLS обратно
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 9. Проверяем результат
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'test_results';

-- 10. Проверяем новые политики
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

-- 11. Тестовый запрос для проверки доступа
SELECT COUNT(*) as total_test_results FROM test_results;
