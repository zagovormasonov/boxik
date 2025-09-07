-- ==============================================
-- БЫСТРОЕ УДАЛЕНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ==============================================

-- Удаляем всех тестовых пользователей
DELETE FROM users 
WHERE 
  email LIKE 'test_%@example.com' OR
  provider = 'test' OR
  name LIKE '%Тестовый%' OR
  email LIKE '%test%';

-- Показываем результат
SELECT 
  'Оставшиеся пользователи' as info,
  COUNT(*) as count
FROM users;

SELECT 
  provider,
  COUNT(*) as count
FROM users 
GROUP BY provider
ORDER BY count DESC;
