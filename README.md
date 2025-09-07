# Boxik PWA

PWA приложение на React + TypeScript + Vite с тестами и авторизацией.

## Возможности

- 📱 PWA функциональность
- 🧪 Интерактивный тест с прогресс-баром
- 🔐 Авторизация и регистрация
- 🟡 Вход через Яндекс
- 💾 Интеграция с Supabase
- 📱 Адаптивный дизайн

## Технологии

- React 18
- TypeScript
- Vite
- React Router
- Supabase
- Lucide React (иконки)
- PWA Plugin

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Заполните переменные окружения:
- `VITE_SUPABASE_URL` - URL вашего проекта Supabase
- `VITE_SUPABASE_ANON_KEY` - анонимный ключ Supabase
- `VITE_YANDEX_CLIENT_ID` - ID клиента Яндекс OAuth
- `VITE_YANDEX_REDIRECT_URI` - URI для редиректа Яндекс

## Запуск

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Предварительный просмотр
npm run preview
```

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── AuthForm/       # Форма авторизации
│   ├── AuthScreen/     # Экран авторизации
│   ├── Navigation/     # Навигация теста
│   ├── ProgressBar/    # Прогресс-бар
│   ├── QuestionCard/   # Карточка вопроса
│   ├── TestScreen/     # Экран теста
│   └── YandexAuth/     # Авторизация через Яндекс
├── contexts/           # React контексты
│   ├── AuthContext.tsx # Контекст авторизации
│   └── TestContext.tsx # Контекст теста
├── lib/               # Утилиты и конфигурация
│   ├── supabase.ts    # Настройка Supabase
│   └── yandexAuth.ts  # Настройка Яндекс OAuth
├── types/             # TypeScript типы
│   └── index.ts       # Основные типы
├── App.tsx            # Главный компонент
├── main.tsx           # Точка входа
└── index.css          # Глобальные стили
```

## Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Создайте таблицы:
   - `users` - для хранения пользователей
   - `test_results` - для хранения результатов тестов
3. Настройте RLS (Row Level Security) политики
4. Получите URL и анонимный ключ из настроек проекта

## Настройка Яндекс OAuth

1. Зарегистрируйте приложение в [Яндекс.OAuth](https://oauth.yandex.ru/)
2. Получите Client ID
3. Настройте redirect URI
4. Добавьте Client ID в переменные окружения

## PWA

Приложение настроено как PWA с:
- Манифестом для установки
- Service Worker для кэширования
- Иконками для различных устройств
- Автоматическим обновлением

## Лицензия

MIT

