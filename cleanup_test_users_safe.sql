-- ==============================================
-- ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ==============================================

-- Показываем всех пользователей с тестовыми email
SELECT 'Тестовые email' as category, id, email, name, provider, created_at
FROM users 
WHERE email LIKE 'test_%@example.com'
UNION ALL
SELECT 'Provider test' as category, id, email, name, provider, created_at
FROM users 
WHERE provider = 'test'
UNION ALL
SELECT 'Имена с "Тестовый"' as category, id, email, name, provider, created_at
FROM users 
WHERE name LIKE '%Тестовый%'
UNION ALL
SELECT 'Email с "test"' as category, id, email, name, provider, created_at
FROM users 
WHERE email LIKE '%test%'
ORDER BY category, created_at DESC;

-- Показываем общее количество пользователей
SELECT COUNT(*) as total_users FROM users;

-- Показываем количество по провайдерам
SELECT 
  provider,
  COUNT(*) as count
FROM users 
GROUP BY provider
ORDER BY count DESC;

-- ==============================================
-- УДАЛЕНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ==============================================
-- Раскомментируйте следующие строки для удаления:

-- DELETE FROM users WHERE email LIKE 'test_%@example.com';
-- DELETE FROM users WHERE provider = 'test';
-- DELETE FROM users WHERE name LIKE '%Тестовый%';
-- DELETE FROM users WHERE email LIKE '%test%';

-- ==============================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ==============================================
-- После удаления выполните:

-- SELECT COUNT(*) as remaining_users FROM users;
-- SELECT provider, COUNT(*) as count FROM users GROUP BY provider;
