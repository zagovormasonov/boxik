-- Проверяем текущие настройки RLS для таблицы test_results
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'test_results';

-- Альтернативная проверка RLS через системные таблицы
SELECT 
    c.relname as table_name,
    c.relrowsecurity as row_security_enabled,
    c.relforcerowsecurity as force_row_security
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'test_results' AND n.nspname = 'public';

-- Проверяем политики RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'test_results';

-- Временно отключаем RLS для тестирования
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- Создаем простую политику для чтения всех записей (временно для тестирования)
DROP POLICY IF EXISTS "Allow all read access" ON test_results;
CREATE POLICY "Allow all read access" ON test_results
    FOR SELECT
    USING (true);

-- Включаем RLS обратно
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Проверяем результат
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'test_results';

-- Проверяем новые политики RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'test_results';

-- Альтернативная проверка RLS после изменений
SELECT 
    c.relname as table_name,
    c.relrowsecurity as row_security_enabled,
    c.relforcerowsecurity as force_row_security
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'test_results' AND n.nspname = 'public';
