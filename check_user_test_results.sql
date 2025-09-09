-- Проверяем результаты теста для конкретного пользователя
-- Замените '4f65b376-11a6-4a73-90eb-b5c3328cce22' на нужный user_id

-- Проверяем все результаты теста для пользователя
SELECT 
    id,
    user_id,
    test_type,
    score,
    grade,
    completed_at
FROM test_results 
WHERE user_id = '4f65b376-11a6-4a73-90eb-b5c3328cce22'
ORDER BY completed_at DESC;

-- Проверяем связи в test_user_mapping
SELECT 
    id,
    user_id,
    test_result_id
FROM test_user_mapping 
WHERE user_id = '4f65b376-11a6-4a73-90eb-b5c3328cce22';

-- Проверяем общее количество результатов теста
SELECT COUNT(*) as total_test_results FROM test_results;

-- Проверяем последние 5 результатов теста
SELECT 
    id,
    user_id,
    test_type,
    score,
    grade,
    completed_at
FROM test_results 
ORDER BY completed_at DESC 
LIMIT 5;

-- Проверяем структуру таблицы test_results
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'test_results' 
ORDER BY ordinal_position;
