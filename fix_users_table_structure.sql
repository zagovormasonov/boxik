-- Проверка и исправление структуры таблицы users
-- Выполните этот скрипт в Supabase для диагностики проблемы

-- 1. Проверяем структуру таблицы users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Проверяем данные в таблице users
SELECT id, email, name, haspaid, created_at 
FROM users 
WHERE id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';

-- 3. Если колонка haspaid не существует, создаем её
-- (Раскомментируйте, если нужно создать колонку)
/*
ALTER TABLE users ADD COLUMN IF NOT EXISTS haspaid BOOLEAN DEFAULT FALSE;
*/

-- 4. Если колонка называется hasPaid (с большой буквы), переименовываем её
-- (Раскомментируйте, если нужно переименовать)
/*
ALTER TABLE users RENAME COLUMN "hasPaid" TO haspaid;
*/

-- 5. Обновляем все NULL значения на FALSE
UPDATE users SET haspaid = FALSE WHERE haspaid IS NULL;

-- 6. Проверяем результат
SELECT id, email, name, haspaid, created_at 
FROM users 
WHERE id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';

-- 7. Проверяем все пользователи
SELECT id, email, name, haspaid, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
