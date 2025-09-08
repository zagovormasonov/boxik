-- Добавление колонки hasPaid в таблицу users
-- Это решит проблему с сохранением статуса оплаты независимо от сессии

-- Добавляем колонку hasPaid в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS hasPaid BOOLEAN DEFAULT FALSE;

-- Создаем индекс для быстрого поиска по hasPaid
CREATE INDEX IF NOT EXISTS idx_users_hasPaid ON users(hasPaid);

-- Обновляем существующих пользователей (устанавливаем false для всех)
UPDATE users SET hasPaid = FALSE WHERE hasPaid IS NULL;

-- Создаем функцию для обновления hasPaid
CREATE OR REPLACE FUNCTION update_user_hasPaid(user_id UUID, paid_status BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE users 
  SET hasPaid = paid_status 
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для получения hasPaid
CREATE OR REPLACE FUNCTION get_user_hasPaid(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT hasPaid INTO result 
  FROM users 
  WHERE id = user_id;
  
  RETURN COALESCE(result, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Комментарии
COMMENT ON COLUMN users.hasPaid IS 'Статус оплаты пользователя: true - оплатил, false - не оплатил';
COMMENT ON FUNCTION update_user_hasPaid IS 'Обновляет статус оплаты пользователя';
COMMENT ON FUNCTION get_user_hasPaid IS 'Получает статус оплаты пользователя';

-- Проверяем результат
SELECT 
  id, 
  email, 
  name, 
  hasPaid,
  created_at
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
