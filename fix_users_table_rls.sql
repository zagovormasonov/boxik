-- Исправление RLS для таблицы users
-- Этот скрипт исправляет проблемы с доступом к таблице users

-- 1. Проверяем текущее состояние RLS
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

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
WHERE tablename = 'users';

-- 3. Временно отключаем RLS для исправления
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Удаляем все существующие политики
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for all users" ON users;
DROP POLICY IF EXISTS "Enable update for all users" ON users;
DROP POLICY IF EXISTS "Enable delete for all users" ON users;

-- 5. Создаем новую политику для чтения (все авторизованные пользователи)
CREATE POLICY "Enable read access for authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Создаем политику для вставки (все авторизованные пользователи)
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Создаем политику для обновления (все авторизованные пользователи)
CREATE POLICY "Enable update for authenticated users" ON users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Создаем политику для удаления (все авторизованные пользователи)
CREATE POLICY "Enable delete for authenticated users" ON users
    FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Включаем RLS обратно
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 10. Проверяем результат
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'users';

-- 11. Проверяем новые политики
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
WHERE tablename = 'users';

-- 12. Тестовый запрос для проверки доступа
SELECT COUNT(*) as total_users FROM users;
