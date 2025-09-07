-- Быстрое исправление RLS политик для таблицы users
-- Выполните эти команды в Supabase SQL Editor

-- 1. Удаляем старые политики
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 2. Создаем новые политики
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- 3. Создаем политику для upsert (обновление или создание)
CREATE POLICY "Users can upsert own profile" ON users
    FOR ALL USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- 4. Проверяем что политики созданы
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

-- 5. Проверяем что RLS включен
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
