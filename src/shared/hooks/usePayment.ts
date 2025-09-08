import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { useSubscriptions } from './useSubscriptions'

export interface PaymentConfig {
  terminalKey: string
  password: string
  apiUrl: string
  amount: number
  description: string
  userId?: string
  userEmail?: string
  isTestMode?: boolean
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  paymentUrl?: string
  error?: string
}

export interface TinkoffInitRequest {
  TerminalKey: string
  Amount: number
  OrderId: string
  Description: string
  Token: string
  SuccessURL?: string
  FailURL?: string
}

export interface TinkoffInitResponse {
  Success: boolean
  ErrorCode: string
  Message?: string
  Details?: string
  TerminalKey: string
  Status: string
  PaymentId: string
  PaymentURL?: string
}

export function usePayment() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createSubscription } = useSubscriptions()

  // Конфигурация для Тинькофф СБП
  const defaultConfig: PaymentConfig = {
    terminalKey: import.meta.env.VITE_TINKOFF_TERMINAL_KEY || process.env.VITE_TINKOFF_TERMINAL_KEY || 'your_terminal_key',
    password: import.meta.env.VITE_TINKOFF_PASSWORD || process.env.VITE_TINKOFF_PASSWORD || 'your_password',
    apiUrl: import.meta.env.VITE_TINKOFF_API_URL || process.env.VITE_TINKOFF_API_URL || 'https://securepay.tinkoff.ru/v2/',
    amount: 200, // 200 рублей за доступ к результатам
    description: 'Доступ к результатам психологического теста БПД'
  }

  // Функция для генерации токена Тинькофф
  const generateToken = (params: Record<string, any>, password: string): string => {
    // Сортируем параметры по ключу
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as Record<string, any>)

    // Добавляем пароль
    sortedParams.Password = password

    // Создаем строку для хеширования (только значения, без ключей)
    const tokenString = Object.values(sortedParams).join('')

    console.log('🔐 Генерируем токен:', {
      sortedParams: { ...sortedParams, Password: '[СКРЫТО]' },
      tokenStringLength: tokenString.length
    })

    // Генерируем SHA-256 хеш
    return CryptoJS.SHA256(tokenString).toString()
  }

  const createPayment = async (config: Partial<PaymentConfig> = {}): Promise<PaymentResult> => {
    setIsProcessing(true)
    setError(null)

    try {
      const paymentConfig = { ...defaultConfig, ...config }
      
      // Отладочная информация для проверки переменных окружения
      console.log('🔧 Отладка переменных окружения:')
      console.log('- VITE_TINKOFF_TERMINAL_KEY:', import.meta.env.VITE_TINKOFF_TERMINAL_KEY ? '✅ Настроен' : '❌ Не настроен')
      console.log('- VITE_TINKOFF_PASSWORD:', import.meta.env.VITE_TINKOFF_PASSWORD ? '✅ Настроен' : '❌ Не настроен')
      console.log('- VITE_TINKOFF_API_URL:', import.meta.env.VITE_TINKOFF_API_URL || 'Используется по умолчанию')
      
      // Проверяем, что переменные окружения настроены или включен тестовый режим
      if (paymentConfig.terminalKey === 'your_terminal_key' || paymentConfig.password === 'your_password' || paymentConfig.isTestMode) {
        console.warn('⚠️ Тестовый режим активирован:', {
          envNotSet: paymentConfig.terminalKey === 'your_terminal_key' || paymentConfig.password === 'your_password',
          explicitTestMode: paymentConfig.isTestMode
        })
        
        // Тестовый режим - симуляция
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Создаем запись о подписке в Supabase даже в тестовом режиме
        if (paymentConfig.userId) {
          const testPaymentId = 'test_payment_' + Date.now()
          const testOrderId = `u${paymentConfig.userId.substring(0, 8)}test${Date.now().toString().substring(8)}`
          
          const subscriptionData = {
            user_id: paymentConfig.userId,
            payment_id: testPaymentId,
            order_id: testOrderId,
            amount: paymentConfig.amount * 100, // в копейках
            payment_url: 'https://securepay.tinkoff.ru/payments/test_payment',
            metadata: {
              user_email: paymentConfig.userEmail,
              description: paymentConfig.description,
              created_at: new Date().toISOString(),
              is_test_mode: true
            }
          }

          console.log('💾 Сохраняем тестовую подписку в Supabase:', subscriptionData)
          await createSubscription(subscriptionData)
          
          const mockResult: PaymentResult = {
            success: true,
            paymentId: testPaymentId,
            paymentUrl: `/payment/callback?PaymentId=${testPaymentId}&Status=CONFIRMED&OrderId=${testOrderId}`
          }
          
          console.log('🧪 Тестовый режим: возвращаем моковый результат', mockResult)
          return mockResult
        }
        
        const mockResult: PaymentResult = {
          success: true,
          paymentId: 'test_payment_' + Date.now(),
          paymentUrl: '/payment/callback?PaymentId=test_payment_' + Date.now() + '&Status=CONFIRMED&OrderId=test_order_' + Date.now()
        }
        
        console.log('🧪 Тестовый режим: возвращаем моковый результат', mockResult)
        return mockResult
      }

      console.log('💳 Создаем реальный платеж через Тинькофф СБП:', {
        terminalKey: paymentConfig.terminalKey,
        amount: paymentConfig.amount,
        description: paymentConfig.description,
        apiUrl: paymentConfig.apiUrl
      })

      // Генерируем уникальный ID заказа (максимум 20 символов для Тинькофф)
      const timestamp = Date.now().toString()
      const random = Math.random().toString(36).substring(2, 8)
      let orderId = paymentConfig.userId 
        ? `u${paymentConfig.userId.substring(0, 8)}${timestamp.substring(timestamp.length - 8)}${random}`
        : `o${timestamp.substring(timestamp.length - 10)}${random}`

      // Проверяем длину OrderId
      if (orderId.length > 20) {
        orderId = `o${timestamp.substring(timestamp.length - 15)}${random}`
        console.warn('OrderId слишком длинный, используем короткий:', orderId)
      }

      // Очищаем описание от специальных символов
      const cleanDescription = paymentConfig.description
        .replace(/[^\w\s\-\.]/g, '') // Убираем все кроме букв, цифр, пробелов, дефисов и точек
        .substring(0, 250) // Максимум 250 символов

      console.log('Создаем платеж для пользователя:', {
        userId: paymentConfig.userId,
        userEmail: paymentConfig.userEmail,
        orderId,
        cleanDescription
      })

      // Добавляем URL для callback'а (проверяем валидность)
      const callbackUrl = `${window.location.origin}/payment/callback`
      console.log('Callback URL:', callbackUrl)

      // Подготавливаем данные для запроса
      const requestData: TinkoffInitRequest = {
        TerminalKey: paymentConfig.terminalKey,
        Amount: paymentConfig.amount * 100, // Тинькофф принимает сумму в копейках
        OrderId: orderId,
        Description: cleanDescription,
        SuccessURL: callbackUrl,
        FailURL: callbackUrl,
        Token: '' // Будет заполнен после генерации
      }

      // Генерируем токен
      const token = generateToken({
        TerminalKey: requestData.TerminalKey,
        Amount: requestData.Amount,
        OrderId: requestData.OrderId,
        Description: requestData.Description,
        SuccessURL: requestData.SuccessURL,
        FailURL: requestData.FailURL
      }, paymentConfig.password)

      requestData.Token = token

      // Валидация параметров перед отправкой
      if (!requestData.TerminalKey || requestData.TerminalKey.length === 0) {
        throw new Error('TerminalKey не может быть пустым')
      }
      if (requestData.Amount <= 0) {
        throw new Error('Amount должен быть больше 0')
      }
      if (!requestData.OrderId || requestData.OrderId.length === 0) {
        throw new Error('OrderId не может быть пустым')
      }
      if (requestData.OrderId.length > 20) {
        throw new Error('OrderId не может быть длиннее 20 символов')
      }
      if (!requestData.Description || requestData.Description.length === 0) {
        throw new Error('Description не может быть пустым')
      }

      console.log('📤 Отправляем запрос в Тинькофф:', {
        url: paymentConfig.apiUrl + 'Init',
        data: { 
          TerminalKey: requestData.TerminalKey,
          Amount: requestData.Amount,
          OrderId: requestData.OrderId,
          Description: requestData.Description,
          SuccessURL: requestData.SuccessURL,
          FailURL: requestData.FailURL,
          Token: '[СКРЫТО]'
        }
      })

      // Отправляем запрос в Тинькофф
      const response = await fetch(paymentConfig.apiUrl + 'Init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: TinkoffInitResponse = await response.json()

      console.log('📥 Ответ от Тинькофф:', result)

      if (result.Success) {
        // Создаем запись о подписке в Supabase
        if (paymentConfig.userId) {
          const subscriptionData = {
            user_id: paymentConfig.userId,
            payment_id: result.PaymentId,
            order_id: orderId,
            amount: paymentConfig.amount * 100, // в копейках
            payment_url: result.PaymentURL,
            metadata: {
              user_email: paymentConfig.userEmail,
              description: paymentConfig.description,
              created_at: new Date().toISOString()
            }
          }

          console.log('💾 Сохраняем подписку в Supabase:', subscriptionData)
          await createSubscription(subscriptionData)
        }

        return {
          success: true,
          paymentId: result.PaymentId,
          paymentUrl: result.PaymentURL
        }
      } else {
        const errorMessage = `Ошибка Тинькофф: ${result.Message || 'Неизвестная ошибка'} (код: ${result.ErrorCode})`
        console.error('❌ Ошибка создания платежа:', errorMessage)
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage
        }
      }

    } catch (err) {
      console.error('❌ Ошибка при создании платежа:', err)
      const errorMessage = err instanceof Error ? err.message : 'Не удалось создать платеж. Попробуйте еще раз.'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const checkPaymentStatus = async (paymentId: string): Promise<boolean> => {
    try {
      // Здесь будет проверка статуса платежа через Тинькофф API
      // Пока что симуляция успешной оплаты
      console.log('Проверяем статус платежа:', paymentId)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // В реальной реализации:
      // 1. Отправляем GET запрос на /GetState
      // 2. Проверяем статус платежа
      // 3. Возвращаем true если оплачен

      return true // Симуляция успешной оплаты
    } catch (err) {
      console.error('Ошибка при проверке статуса платежа:', err)
      return false
    }
  }

  return {
    createPayment,
    checkPaymentStatus,
    isProcessing,
    error,
    defaultConfig
  }
}