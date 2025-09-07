-- Упрощенный SQL скрипт для быстрой настройки Supabase
-- Выполните эти команды в Supabase SQL Editor

-- ==============================================
-- БЫСТРАЯ НАСТРОЙКА (МИНИМАЛЬНАЯ)
-- ==============================================

-- 1. Создаем таблицы
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers INTEGER[] NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создаем индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);

-- 3. ВРЕМЕННО ОТКЛЮЧАЕМ RLS (только для разработки!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_results DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- ГОТОВО! Теперь можно тестировать приложение
-- ==============================================

-- Проверка
SELECT 'Таблицы созданы успешно!' as status;
SELECT tablename FROM pg_tables WHERE tablename IN ('users', 'test_results');
