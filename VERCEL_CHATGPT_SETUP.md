# 🚀 Быстрая настройка ChatGPT на Vercel

## 1. Получите API ключ
- Перейдите на [OpenAI Platform](https://platform.openai.com/)
- Создайте API ключ в разделе "API Keys"
- Скопируйте ключ (начинается с `sk-`)

## 2. Добавьте в Vercel
- Откройте проект в [Vercel Dashboard](https://vercel.com/dashboard)
- Settings → Environment Variables
- Добавьте переменную:
  - **Name**: `REACT_APP_CHATGPT_API_KEY`
  - **Value**: ваш API ключ
- Нажмите Save

## 3. Перезапустите деплой
- Deployments → Redeploy последний деплой
- Или сделайте новый коммит

## ✅ Готово!
Теперь ChatGPT будет генерировать персональные рекомендации на основе результатов теста БПД.

**Стоимость**: ~$0.01-0.05 за рекомендацию
