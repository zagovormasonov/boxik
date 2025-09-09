-- Создаем тестовый результат для проверки работы системы
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Создаем тестовый результат для пользователя
INSERT INTO test_results (
    id,
    user_id,
    test_type,
    score,
    total_questions,
    answers,
    completed_at,
    percentage,
    grade,
    category_scores
) VALUES (
    gen_random_uuid(),
    '4f65b376-11a6-4a73-90eb-b5c3328cce22',
    'bpd',
    15,
    20,
    ARRAY['1', '2', '3', '4', '5'],
    NOW(),
    75,
    'moderate',
    '{"category1": 5, "category2": 10}'::jsonb
);

-- 2. Проверяем, что результат создался
SELECT 
    id,
    user_id,
    test_type,
    score,
    grade,
    completed_at
FROM test_results 
WHERE user_id = '4f65b376-11a6-4a73-90eb-b5c3328cce22';

-- 3. Проверяем общее количество результатов
SELECT COUNT(*) as total_results FROM test_results;

-- 4. Тестируем запрос, который использует приложение
SELECT * FROM test_results 
WHERE user_id = '4f65b376-11a6-4a73-90eb-b5c3328cce22'
ORDER BY completed_at DESC 
LIMIT 1;
