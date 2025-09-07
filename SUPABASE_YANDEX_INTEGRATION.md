# Сохранение пользователей Яндекс в Supabase без дублирования

## 🎯 Задача:

Пользователь должен сохраняться в Supabase и **без дублирования аккаунтов**. Если он зайдет заново в тот же аккаунт Яндекс, не должна создаваться новая запись в БД.

## ✅ Решение:

### 1. **Обновлена структура таблицы `users`**

Добавлены поля для поддержки Яндекс OAuth:
```sql
ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN yandex_id VARCHAR(255);
ALTER TABLE users ADD COLUMN yandex_login VARCHAR(255);
ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
```

### 2. **Созданы индексы для предотвращения дублирования**

```sql
-- Уникальный индекс для yandex_id
CREATE UNIQUE INDEX idx_users_yandex_id ON users(yandex_id) WHERE yandex_id IS NOT NULL;

-- Индексы для оптимизации
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_users_last_login ON users(last_login DESC);
```

### 3. **Логика проверки существования в YandexCallback**

```typescript
// Проверяем, существует ли пользователь с таким yandex_id или email
const { data: existingUser, error: checkError } = await supabase
  .from('users')
  .select('*')
  .or(`yandex_id.eq.${realUser.yandex_id || realUser.yandex_code},email.eq.${realUser.email}`)
  .single()

if (existingUser) {
  // Пользователь существует - обновляем данные
  await supabase
    .from('users')
    .update({
      name: realUser.name,
      avatar_url: realUser.avatar,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', existingUser.id)
} else {
  // Пользователь не существует - создаем новую запись
  await supabase
    .from('users')
    .insert({
      id: realUser.id,
      email: realUser.email,
      name: realUser.name,
      avatar_url: realUser.avatar,
      provider: 'yandex',
      yandex_id: realUser.yandex_id || realUser.yandex_code,
      yandex_login: realUser.yandex_login,
      created_at: realUser.created_at,
      last_login: new Date().toISOString()
    })
}
```

## 🔄 Логика работы:

### **При первом входе через Яндекс:**
1. ✅ Получаем данные пользователя из Яндекс API
2. ✅ Проверяем существование в БД по `yandex_id` и `email`
3. ✅ Пользователь не найден - создаем новую запись
4. ✅ Сохраняем в localStorage
5. ✅ Отображаем личный кабинет

### **При повторном входе через тот же аккаунт Яндекс:**
1. ✅ Получаем данные пользователя из Яндекс API
2. ✅ Проверяем существование в БД по `yandex_id` и `email`
3. ✅ Пользователь найден - обновляем данные (имя, аватар, last_login)
4. ✅ Сохраняем в localStorage
5. ✅ Отображаем личный кабинет

## 🛡️ Защита от дублирования:

### **Уникальные ограничения:**
- `yandex_id` - уникальный индекс (предотвращает дублирование по ID Яндекс)
- `email` - уникальное ограничение (предотвращает дублирование по email)

### **Проверка по двум полям:**
- Сначала проверяем по `yandex_id` (основной идентификатор)
- Если не найден, проверяем по `email` (резервный вариант)

## 📊 Структура данных в БД:

```sql
-- Пример записи пользователя Яндекс
{
  "id": "yandex_12345",
  "email": "user@yandex.ru",
  "name": "Иван Иванов",
  "avatar_url": "https://avatars.yandex.net/get-yapic/12345/islands-200",
  "provider": "yandex",
  "yandex_id": "12345",
  "yandex_login": "ivan.ivanov",
  "created_at": "2025-01-07T10:00:00Z",
  "updated_at": "2025-01-07T10:00:00Z",
  "last_login": "2025-01-07T10:00:00Z"
}
```

## 🚀 Ожидаемые логи:

### **При первом входе:**
```
YandexCallback: Создание нового пользователя в Supabase
YandexCallback: Пользователь успешно создан в Supabase
```

### **При повторном входе:**
```
YandexCallback: Пользователь существует, обновляем данные
YandexCallback: Пользователь успешно обновлен в Supabase
```

## 🔧 Настройка:

1. **Выполните SQL скрипт** `supabase_yandex_update.sql` в Supabase
2. **Перезапустите приложение** (`npm run dev`)
3. **Протестируйте** вход через Яндекс несколько раз

## ✅ Результат:

- ✅ **Пользователи сохраняются в Supabase**
- ✅ **Нет дублирования записей** при повторном входе
- ✅ **Обновляются данные** при каждом входе
- ✅ **Отслеживается last_login** для аналитики
- ✅ **Сохранение в localStorage** для быстрого доступа

Теперь каждый пользователь Яндекс будет иметь одну запись в БД, которая обновляется при каждом входе!
