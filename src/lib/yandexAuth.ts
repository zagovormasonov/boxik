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

// URL для авторизации через Яндекс
export const getYandexAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: yandexConfig.clientId,
    redirect_uri: yandexConfig.redirectUri,
    scope: yandexConfig.scope
  })
  
  return `https://oauth.yandex.ru/authorize?${params.toString()}`
}

// Функция для обработки callback от Яндекс
export const handleYandexCallback = async (code: string) => {
  try {
    // Здесь будет логика обмена кода на токен
    console.log('YandexAuth: Получен код авторизации', code)
    
    // Имитация получения данных пользователя
    return {
      id: 'yandex-user-id',
      email: 'user@yandex.ru',
      name: 'Пользователь Яндекс',
      avatar: 'https://avatars.yandex.net/get-yapic/0/0-0/islands-200'
    }
  } catch (error) {
    console.error('YandexAuth: Ошибка обработки callback', error)
    throw error
  }
}

