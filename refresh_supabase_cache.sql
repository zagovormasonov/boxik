-- Принудительное обновление кеша схемы в Supabase
-- Выполните этот скрипт для обновления кеша

-- Принудительно обновляем кеш схемы
NOTIFY pgrst, 'reload schema';

-- Проверяем, что колонка hasPaid существует
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'hasPaid';

-- Проверяем текущие значения hasPaid для вашего пользователя
SELECT 
  id, 
  email, 
  name, 
  hasPaid,
  created_at
FROM users 
WHERE id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';

-- Обновляем статус для вашего пользователя (если нужно)
UPDATE users 
SET hasPaid = TRUE 
WHERE id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';

-- Проверяем результат
SELECT 
  id, 
  email, 
  name, 
  hasPaid,
  created_at
FROM users 
WHERE id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';
