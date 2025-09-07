-- ==============================================
-- УДАЛЕНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ==============================================

-- Удаляем всех пользователей с тестовыми email
DELETE FROM users 
WHERE email LIKE 'test_%@example.com';

-- Удаляем всех пользователей с provider = 'test'
DELETE FROM users 
WHERE provider = 'test';

-- Удаляем всех пользователей с именами содержащими "Тестовый"
DELETE FROM users 
WHERE name LIKE '%Тестовый%';

-- Удаляем всех пользователей с email содержащими "test"
DELETE FROM users 
WHERE email LIKE '%test%';

-- Показываем оставшихся пользователей
SELECT 
  id,
  email,
  name,
  provider,
  yandex_id,
  created_at,
  last_login
FROM users 
ORDER BY created_at DESC;

-- Показываем количество пользователей по провайдерам
SELECT 
  provider,
  COUNT(*) as count
FROM users 
GROUP BY provider;
