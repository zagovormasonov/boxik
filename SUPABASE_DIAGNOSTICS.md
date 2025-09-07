# Диагностика проблемы с сохранением в Supabase

## 🐛 Проблема:

Пользователь по-прежнему не сохраняется в Supabase, несмотря на исправления кода.

## 🔧 Диагностические инструменты:

### 1. **Добавлен тестовый компонент SupabaseTest**
- Проверяет подключение к Supabase
- Тестирует доступность таблицы `users`
- Пробует создать тестовую запись
- Показывает подробные ошибки

### 2. **Улучшено логирование в YandexCallback**
- Добавлены детальные логи для каждого шага
- Используется `upsert` с fallback на простую вставку
- Показываются все ошибки базы данных

### 3. **Создан SQL скрипт для проверки**
- `supabase_users_check.sql` - проверяет структуру таблицы
- Создает таблицу если она не существует
- Настраивает RLS политики

## 🚀 Пошаговая диагностика:

### **Шаг 1: Проверьте тестовый компонент**
1. Откройте приложение (`npm run dev`)
2. Перейдите на экран авторизации
3. Посмотрите на компонент "🔧 Тест подключения к Supabase"
4. Проверьте статус и ошибки

### **Шаг 2: Выполните SQL скрипт**
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Выполните скрипт `supabase_users_check.sql`
4. Проверьте, что таблица создана

### **Шаг 3: Проверьте логи консоли**
При входе через Яндекс должны быть логи:
```
YandexCallback: Сохранение пользователя в Supabase {...}
YandexCallback: Попытка upsert пользователя
YandexCallback: Пользователь успешно сохранен (upsert) {...}
```

## 🔍 Возможные причины:

### **1. Таблица не создана**
- **Симптом:** Ошибка "relation 'users' does not exist"
- **Решение:** Выполните `supabase_users_check.sql`

### **2. RLS политики блокируют**
- **Симптом:** Ошибка "new row violates row-level security policy"
- **Решение:** Проверьте RLS политики в скрипте

### **3. Неправильные ключи**
- **Симптом:** Ошибка "Invalid API key"
- **Решение:** Проверьте `.env` файл

### **4. Проблемы с сетью**
- **Симптом:** Ошибка "Failed to fetch"
- **Решение:** Проверьте интернет и URL Supabase

## 📊 Ожидаемые результаты теста:

### **✅ Успешный тест:**
```
✅ Подключение к Supabase работает
✅ Таблица users доступна
✅ Тестовая запись создана успешно
✅ Supabase полностью работает!
```

### **❌ Ошибки и решения:**

#### **"relation 'users' does not exist"**
```sql
-- Выполните в Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
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

#### **"new row violates row-level security policy"**
```sql
-- Выполните в Supabase SQL Editor:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);
```

#### **"Invalid API key"**
```env
# Проверьте .env файл:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🎯 Следующие шаги:

1. **Запустите приложение** и проверьте тестовый компонент
2. **Выполните SQL скрипт** если есть ошибки
3. **Попробуйте войти через Яндекс** и проверьте логи
4. **Сообщите результаты** тестирования

Тестовый компонент покажет точную причину проблемы!
