-- Полное исправление RLS для таблицы test_results
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Полностью отключаем RLS
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем ВСЕ политики (если есть)
DROP POLICY IF EXISTS "Enable read access for all users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for all users" ON test_results;
DROP POLICY IF EXISTS "Enable update for all users" ON test_results;
DROP POLICY IF EXISTS "Enable delete for all users" ON test_results;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON test_results;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON test_results;
DROP POLICY IF EXISTS "test_results_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_select_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_insert_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_update_policy" ON test_results;
DROP POLICY IF EXISTS "test_results_delete_policy" ON test_results;

-- 3. Проверяем, что RLS отключен
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'test_results';

-- 4. Проверяем, что нет политик
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'test_results';

-- 5. Тестируем доступ (должен работать без ошибок)
SELECT COUNT(*) as test_count FROM test_results;

-- 6. Если все работает, создаем простую политику для чтения
CREATE POLICY "test_results_read_policy" ON test_results
    FOR SELECT USING (true);

-- 7. Создаем политику для вставки
CREATE POLICY "test_results_insert_policy" ON test_results
    FOR INSERT WITH CHECK (true);

-- 8. Создаем политику для обновления
CREATE POLICY "test_results_update_policy" ON test_results
    FOR UPDATE USING (true);

-- 9. Включаем RLS обратно
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- 10. Проверяем финальный результат
SELECT COUNT(*) as final_test_count FROM test_results;
