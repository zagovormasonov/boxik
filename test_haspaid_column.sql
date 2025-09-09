-- Тест для проверки колонки hasPaid в таблице users
-- Выполните этот скрипт в Supabase для проверки

-- Проверяем структуру таблицы users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'hasPaid';

-- Проверяем текущие значения hasPaid
SELECT id, email, name, hasPaid, created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- Проверяем функции
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%hasPaid%';
