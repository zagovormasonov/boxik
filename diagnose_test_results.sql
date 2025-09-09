-- Проверка и исправление таблицы test_results
-- Выполните этот скрипт в Supabase для диагностики проблемы

-- 1. Проверяем существование таблицы test_results
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'test_results';

-- 2. Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'test_results' 
ORDER BY ordinal_position;

-- 3. Проверяем RLS политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'test_results';

-- 4. Проверяем статус RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'test_results';

-- 5. Проверяем данные в таблице
SELECT COUNT(*) as total_rows FROM test_results;
SELECT * FROM test_results LIMIT 5;

-- 6. Проверяем данные для конкретного пользователя
SELECT * FROM test_results 
WHERE user_id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';

-- 7. Если таблица пуста или недоступна, создаем тестовые данные
-- (Раскомментируйте, если нужно создать тестовые данные)
/*
INSERT INTO test_results (
  id,
  user_id,
  test_type,
  score,
  total_questions,
  answers,
  category_scores,
  completed_at,
  grade,
  percentage
) VALUES (
  gen_random_uuid(),
  '443fa66b-75d3-4f87-98a4-7fad84c2a3a4',
  'bpd',
  49,
  18,
  ARRAY[3, 4, 4, 4, 4, 4, 4, 0, 0, 0, 3, 4, 4, 2, 4, 3, 1, 1],
  '{"anger": 7, "emptiness": 6, "impulsivity": 4, "paranoid_ideation": 2, "suicidal_behavior": 0}',
  NOW(),
  'moderate',
  68
);
*/

-- 8. Если RLS блокирует доступ, временно отключаем его
-- (Раскомментируйте только для тестирования!)
/*
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;
*/

-- 9. Проверяем результат
SELECT * FROM test_results 
WHERE user_id = '443fa66b-75d3-4f87-98a4-7fad84c2a3a4';
