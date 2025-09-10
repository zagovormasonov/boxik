-- Исправление ограничения внешнего ключа в таблице test_results
-- Позволяет сохранять результаты тестов для неавторизованных пользователей

-- 1. Удаляем ограничение внешнего ключа
ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_user_id_fkey;

-- 2. Проверяем структуру таблицы
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'test_results' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Проверяем индексы
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'test_results';

-- 4. Проверяем ограничения
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'test_results'::regclass;
