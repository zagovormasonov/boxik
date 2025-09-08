-- Временное отключение RLS для таблицы subscriptions
-- Это позволит работать с подписками без авторизации в Supabase

-- Отключаем RLS для таблицы subscriptions
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;

-- Альтернативно, можно создать политику для анонимного доступа:
-- CREATE POLICY "Allow anonymous access to subscriptions" ON subscriptions
--   FOR ALL USING (true);

-- Комментарий: RLS отключен для упрощения работы с Yandex OAuth
COMMENT ON TABLE subscriptions IS 'Таблица подписок с отключенным RLS для работы с Yandex OAuth';
