-- Исправление проблемы с внешним ключом для test_results
-- Проблема: test_results.user_id ссылается на users.id, но анонимные пользователи не существуют в users

-- Вариант 1: Создать специального анонимного пользователя
INSERT INTO users (id, email, name, provider, created_at, haspaid)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- Специальный UUID для анонимных пользователей
  'anonymous@system.local',
  'Анонимный пользователь',
  'anonymous',
  NOW(),
  false
)
ON CONFLICT (id) DO NOTHING;

-- Вариант 2: Удалить ограничение внешнего ключа (если не нужна строгая связь)
-- ALTER TABLE test_results DROP CONSTRAINT test_results_user_id_fkey;

-- Вариант 3: Создать триггер для автоматического создания анонимных пользователей
CREATE OR REPLACE FUNCTION create_anonymous_user_if_not_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, существует ли пользователь с таким ID
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id) THEN
    -- Создаем анонимного пользователя
    INSERT INTO users (id, email, name, provider, created_at, haspaid)
    VALUES (
      NEW.user_id,
      'anonymous_' || NEW.user_id || '@system.local',
      'Анонимный пользователь',
      'anonymous',
      NOW(),
      false
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_create_anonymous_user ON test_results;
CREATE TRIGGER trigger_create_anonymous_user
  BEFORE INSERT ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION create_anonymous_user_if_not_exists();

-- Проверяем текущие ограничения
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'test_results';
