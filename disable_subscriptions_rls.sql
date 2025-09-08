-- Временно отключаем RLS для таблицы subscriptions для тестирования
-- ВНИМАНИЕ: Это только для тестирования! В продакшене RLS должен быть включен!

-- Отключаем RLS
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Проверяем статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'subscriptions';

-- Проверяем существующие политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'subscriptions';