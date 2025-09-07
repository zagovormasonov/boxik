# 🔧 Исправление проблемы с переменной окружения

## Проблема
Vite использует префикс `VITE_` для переменных окружения, а не `REACT_APP_`.

## Решение

### 1. Добавьте новую переменную в Vercel
- Откройте [Vercel Dashboard](https://vercel.com/dashboard)
- Settings → Environment Variables
- Добавьте новую переменную:
  - **Name**: `VITE_CHATGPT_API_KEY`
  - **Value**: ваш API ключ (тот же что в `REACT_APP_CHATGPT_API_KEY`)
  - **Environment**: Production

### 2. Перезапустите деплой
- Deployments → Redeploy последний деплой

### 3. Проверьте результат
После перезапуска в консоли должно показать:
```
ChatGPT API Debug:
- import.meta.env.VITE_CHATGPT_API_KEY: true
- Final API_KEY: true
```

## Альтернатива
Можете оставить `REACT_APP_CHATGPT_API_KEY` - код теперь проверяет оба варианта.

## Почему так происходит?
- **Create React App**: использует `REACT_APP_`
- **Vite**: использует `VITE_`
- **Next.js**: использует `NEXT_PUBLIC_`

Ваш проект использует Vite, поэтому лучше использовать `VITE_CHATGPT_API_KEY`.
