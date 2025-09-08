-- Создание таблицы для связывания результатов теста с пользователями
CREATE TABLE IF NOT EXISTS test_user_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE, -- ID сессии неавторизованного пользователя
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- ID авторизованного пользователя
  test_result_id UUID REFERENCES test_results(id) ON DELETE CASCADE, -- ID результата теста
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_test_user_mapping_session_id ON test_user_mapping(session_id);
CREATE INDEX IF NOT EXISTS idx_test_user_mapping_user_id ON test_user_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_test_user_mapping_test_result_id ON test_user_mapping(test_result_id);

-- Создание RLS политик
ALTER TABLE test_user_mapping ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои связи
CREATE POLICY "Users can view own test mappings" ON test_user_mapping
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои связи
CREATE POLICY "Users can create own test mappings" ON test_user_mapping
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои связи
CREATE POLICY "Users can update own test mappings" ON test_user_mapping
  FOR UPDATE USING (auth.uid() = user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_test_user_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_test_user_mapping_updated_at 
  BEFORE UPDATE ON test_user_mapping 
  FOR EACH ROW 
  EXECUTE FUNCTION update_test_user_mapping_updated_at();

-- Комментарии к таблице и полям
COMMENT ON TABLE test_user_mapping IS 'Таблица для связывания результатов теста с пользователями';
COMMENT ON COLUMN test_user_mapping.session_id IS 'ID сессии неавторизованного пользователя';
COMMENT ON COLUMN test_user_mapping.user_id IS 'ID авторизованного пользователя';
COMMENT ON COLUMN test_user_mapping.test_result_id IS 'ID результата теста';
