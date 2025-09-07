-- ==============================================
-- ОБНОВЛЕНИЕ ТАБЛИЦЫ USERS ДЛЯ ПОДДЕРЖКИ YANDEX
-- ==============================================

-- Добавляем поля для Яндекс OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_login VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Создаем уникальный индекс для yandex_id (предотвращает дублирование)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_yandex_id ON users(yandex_id) WHERE yandex_id IS NOT NULL;

-- Создаем индекс для provider
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);

-- Создаем индекс для last_login
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- ==============================================
-- ОБНОВЛЕНИЕ RLS ПОЛИТИК
-- ==============================================

-- Политика для чтения пользователей (все могут читать)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Политика для вставки пользователей (все могут создавать)
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

-- Политика для обновления пользователей (все могут обновлять)
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- ==============================================
-- ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- ==============================================

-- Пример создания пользователя Яндекс
-- INSERT INTO users (id, email, name, avatar_url, provider, yandex_id, yandex_login)
-- VALUES (
--   'yandex_12345',
--   'user@yandex.ru',
--   'Иван Иванов',
--   'https://avatars.yandex.net/get-yapic/12345/islands-200',
--   'yandex',
--   '12345',
--   'ivan.ivanov'
-- );

-- Пример обновления данных пользователя при повторном входе
-- UPDATE users 
-- SET 
--   name = 'Иван Иванов (обновлено)',
--   avatar_url = 'https://avatars.yandex.net/get-yapic/12345/islands-200',
--   last_login = NOW()
-- WHERE yandex_id = '12345';

-- Пример поиска пользователя по yandex_id
-- SELECT * FROM users WHERE yandex_id = '12345';

-- Пример поиска пользователя по email
-- SELECT * FROM users WHERE email = 'user@yandex.ru';
