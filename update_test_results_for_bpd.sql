-- ==============================================
-- ОБНОВЛЕНИЕ ТАБЛИЦЫ TEST_RESULTS ДЛЯ БПД ТЕСТА
-- ==============================================

-- 1. Добавляем новые поля для БПД теста
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS test_type TEXT DEFAULT 'legacy',
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS category_scores JSONB DEFAULT '{}';

-- 2. Обновляем существующие записи
UPDATE test_results 
SET 
  test_type = 'legacy',
  percentage = CASE 
    WHEN total_questions > 0 THEN ROUND((score::FLOAT / total_questions) * 100)
    ELSE 0 
  END,
  grade = CASE 
    WHEN total_questions > 0 AND (score::FLOAT / total_questions) >= 0.8 THEN 'excellent'
    WHEN total_questions > 0 AND (score::FLOAT / total_questions) >= 0.6 THEN 'good'
    WHEN total_questions > 0 AND (score::FLOAT / total_questions) >= 0.4 THEN 'satisfactory'
    ELSE 'poor'
  END
WHERE test_type IS NULL OR test_type = 'legacy';

-- 3. Создаем индекс для test_type
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);

-- 4. Проверяем структуру таблицы
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'test_results' 
ORDER BY ordinal_position;

-- 5. Проверяем данные
SELECT 
  test_type,
  COUNT(*) as count,
  AVG(score) as avg_score,
  AVG(percentage) as avg_percentage
FROM test_results 
GROUP BY test_type;

-- ==============================================
-- ГОТОВО! Теперь таблица поддерживает БПД тест
-- ==============================================
