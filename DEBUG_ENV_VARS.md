# 🔍 Детальная отладка переменных окружения

## Что проверить:

### 1. В Vercel Dashboard:
- Settings → Environment Variables
- Убедитесь что есть `VITE_CHATGPT_API_KEY`
- Проверьте что она добавлена для **Production**
- Значение должно начинаться с `sk-`

### 2. После перезапуска деплоя:
Откройте консоль браузера (F12) и найдите сообщения "ChatGPT API Debug". Должно показать:

```
ChatGPT API Debug:
- import.meta.env.VITE_CHATGPT_API_KEY: true
- Final API_KEY: true
- All VITE vars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_CHATGPT_API_KEY"]
```

### 3. Если переменная не загружается:

**Вариант A: Переименуйте существующую**
- Удалите `REACT_APP_CHATGPT_API_KEY`
- Добавьте `VITE_CHATGPT_API_KEY` с тем же значением

**Вариант B: Добавьте обе переменные**
- Оставьте `REACT_APP_CHATGPT_API_KEY`
- Добавьте `VITE_CHATGPT_API_KEY` с тем же значением

### 4. Проверьте формат ключа:
- Должен начинаться с `sk-`
- Длина обычно 48-51 символ
- Пример: `sk-1234567890abcdef...`

## Если ничего не помогает:

Попробуйте временно добавить ключ прямо в код (только для тестирования):

```typescript
const API_KEY = process.env.REACT_APP_CHATGPT_API_KEY || 
                process.env.VITE_CHATGPT_API_KEY ||
                import.meta.env.VITE_CHATGPT_API_KEY ||
                import.meta.env.REACT_APP_CHATGPT_API_KEY ||
                'sk-your-actual-key-here' // ВРЕМЕННО!
```

⚠️ **Не коммитьте** код с ключом!
