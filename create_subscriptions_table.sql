-- Создание таблицы для хранения данных о подписках
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id VARCHAR(255) NOT NULL UNIQUE,
  order_id VARCHAR(255) NOT NULL UNIQUE,
  amount INTEGER NOT NULL, -- сумма в копейках
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, failed
  payment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- дата истечения подписки (если нужно)
  metadata JSONB -- дополнительные данные о платеже
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id ON subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON subscriptions(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Создание RLS политик
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои подписки
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут создавать свои подписки
CREATE POLICY "Users can create own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои подписки
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблице и полям
COMMENT ON TABLE subscriptions IS 'Таблица для хранения данных о подписках пользователей';
COMMENT ON COLUMN subscriptions.user_id IS 'ID пользователя из auth.users';
COMMENT ON COLUMN subscriptions.payment_id IS 'ID платежа от Тинькофф';
COMMENT ON COLUMN subscriptions.order_id IS 'ID заказа (содержит user_id)';
COMMENT ON COLUMN subscriptions.amount IS 'Сумма платежа в копейках';
COMMENT ON COLUMN subscriptions.status IS 'Статус платежа: pending, confirmed, cancelled, failed';
COMMENT ON COLUMN subscriptions.payment_url IS 'URL для оплаты от Тинькофф';
COMMENT ON COLUMN subscriptions.expires_at IS 'Дата истечения подписки';
COMMENT ON COLUMN subscriptions.metadata IS 'Дополнительные данные о платеже в JSON формате';
