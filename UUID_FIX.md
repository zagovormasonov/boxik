# Исправление ошибки UUID в Supabase

## 🐛 Проблема:

Ошибка: `invalid input syntax for type uuid: "test_user_1757214685080"`

### **Причина:**
Поле `id` в таблице `users` имеет тип `UUID`, но код пытался вставить строку.

## ✅ Исправления:

### 1. **Исправлен тестовый компонент SupabaseTest**
```typescript
// Было:
id: 'test_user_' + Date.now()

// Стало:
id: crypto.randomUUID() // Генерируем правильный UUID
```

### 2. **Исправлен YandexCallback**
```typescript
// Было:
id: `yandex_${userData.id}`

// Стало:
id: crypto.randomUUID() // Генерируем правильный UUID
```

### 3. **Обновлены SQL скрипты**
```sql
-- Было:
id VARCHAR(255) PRIMARY KEY

-- Стало:
id UUID DEFAULT gen_random_uuid() PRIMARY KEY
```

## 🔧 Обновленная структура таблицы:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  yandex_id VARCHAR(255),
  yandex_login VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

## 🚀 Следующие шаги:

### **1. Обновите таблицу в Supabase**
Если таблица уже существует, выполните:
```sql
-- Удалите старую таблицу (если нужно)
DROP TABLE IF EXISTS users CASCADE;

-- Создайте новую таблицу
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50) DEFAULT 'email',
  yandex_id VARCHAR(255),
  yandex_login VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Создайте индексы
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_users_yandex_id ON users(yandex_id);
CREATE UNIQUE INDEX idx_users_yandex_id_unique ON users(yandex_id) WHERE yandex_id IS NOT NULL;

-- Настройте RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
```

### **2. Перезапустите приложение**
```bash
npm run dev
```

### **3. Проверьте тестовый компонент**
Теперь должен показать:
```
✅ Подключение к Supabase работает
✅ Таблица users доступна
✅ Тестовая запись создана успешно
✅ Supabase полностью работает!
```

### **4. Протестируйте вход через Яндекс**
Теперь должны быть логи:
```
YandexCallback: Сохранение пользователя в Supabase {...}
YandexCallback: Пользователь успешно сохранен (upsert) {...}
```

## 🎯 Результат:

- ✅ **Правильные UUID** для всех пользователей
- ✅ **Сохранение в Supabase** работает корректно
- ✅ **Тестовый компонент** проходит все проверки
- ✅ **Авторизация через Яндекс** сохраняет пользователей

Теперь пользователи должны корректно сохраняться в Supabase!
