# Исправление ошибки "Failed to construct 'URL': Invalid URL"

## 🐛 Проблема:

Ошибка `Uncaught TypeError: Failed to construct 'URL': Invalid URL` возникает в продакшене из-за неправильных fallback значений в конфигурации Supabase.

### **Причина:**
В `src/lib/supabase.ts` использовались невалидные fallback значения:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'
```

Строка `'your-supabase-url'` не является валидным URL, что вызывает ошибку при создании Supabase клиента.

## ✅ Исправления:

### 1. **Исправлен src/lib/supabase.ts**
```typescript
// Получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Проверяем, что переменные окружения заданы
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

// Проверяем, что URL валидный
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. **Исправлен src/lib/yandexAuth.ts**
```typescript
// Получаем переменные окружения
const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID
const redirectUri = import.meta.env.VITE_YANDEX_REDIRECT_URI || 'http://localhost:5173/auth/yandex/callback'

// Проверяем, что Client ID задан
if (!clientId) {
  console.warn('VITE_YANDEX_CLIENT_ID не задан. Яндекс авторизация может не работать.')
}

// Конфигурация для Яндекс OAuth
export const yandexConfig = {
  clientId: clientId || '',
  redirectUri,
  scope: 'login:email login:info'
}
```

## 🔧 Настройка переменных окружения:

### **Для локальной разработки (.env):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_YANDEX_CLIENT_ID=your-client-id
VITE_YANDEX_CLIENT_SECRET=your-client-secret
VITE_YANDEX_REDIRECT_URI=http://localhost:5173/auth/yandex/callback
```

### **Для Vercel (Environment Variables):**
1. Откройте Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте переменные:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - `VITE_YANDEX_CLIENT_ID` = `your-client-id`
   - `VITE_YANDEX_CLIENT_SECRET` = `your-client-secret`
   - `VITE_YANDEX_REDIRECT_URI` = `https://your-app.vercel.app/auth/yandex/callback`

## 🚀 Проверка:

### **Локально:**
```bash
npm run dev
```

### **В продакшене:**
- Проверьте, что все переменные окружения заданы в Vercel
- Проверьте, что URL Supabase корректный
- Проверьте консоль браузера на наличие ошибок

## ⚠️ Важные замечания:

### **Безопасность:**
- `VITE_YANDEX_CLIENT_SECRET` должен быть задан только на сервере
- Не добавляйте секретные ключи в публичный код

### **URL для продакшена:**
- `VITE_YANDEX_REDIRECT_URI` должен указывать на ваш домен Vercel
- Например: `https://your-app.vercel.app/auth/yandex/callback`

## ✅ Результат:

- ✅ **Нет ошибок URL** в продакшене
- ✅ **Правильная валидация** переменных окружения
- ✅ **Четкие сообщения об ошибках** при неправильной конфигурации
- ✅ **Готовность к деплою** на Vercel

Теперь приложение должно работать корректно в продакшене!
