import { useState } from 'react'
import CryptoJS from 'crypto-js'

export interface PaymentConfig {
  terminalKey: string
  password: string
  apiUrl: string
  amount: number
  description: string
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

  // Конфигурация для Тинькофф СБП
  const defaultConfig: PaymentConfig = {
    terminalKey: import.meta.env.VITE_TINKOFF_TERMINAL_KEY || process.env.VITE_TINKOFF_TERMINAL_KEY || 'your_terminal_key',
    password: import.meta.env.VITE_TINKOFF_PASSWORD || process.env.VITE_TINKOFF_PASSWORD || 'your_password',
    apiUrl: import.meta.env.VITE_TINKOFF_API_URL || process.env.VITE_TINKOFF_API_URL || 'https://securepay.tinkoff.ru/v2/',
    amount: 500, // 500 рублей за доступ к результатам
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

    // Создаем строку для хеширования
    const tokenString = Object.values(sortedParams).join('')

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
      
      // Проверяем, что переменные окружения настроены
      if (paymentConfig.terminalKey === 'your_terminal_key' || paymentConfig.password === 'your_password') {
        console.warn('⚠️ Переменные окружения Тинькофф не настроены, используем тестовый режим')
        
        // Тестовый режим - симуляция
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockResult: PaymentResult = {
          success: true,
          paymentId: 'test_payment_' + Date.now(),
          paymentUrl: 'https://securepay.tinkoff.ru/payments/test_payment'
        }
        
        return mockResult
      }

      console.log('💳 Создаем реальный платеж через Тинькофф СБП:', {
        terminalKey: paymentConfig.terminalKey,
        amount: paymentConfig.amount,
        description: paymentConfig.description,
        apiUrl: paymentConfig.apiUrl
      })

      // Генерируем уникальный ID заказа
      const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

      // Добавляем URL для callback'а
      const callbackUrl = `${window.location.origin}/payment/callback`
      console.log('Callback URL:', callbackUrl)

      // Подготавливаем данные для запроса
      const requestData: TinkoffInitRequest = {
        TerminalKey: paymentConfig.terminalKey,
        Amount: paymentConfig.amount * 100, // Тинькофф принимает сумму в копейках
        OrderId: orderId,
        Description: paymentConfig.description,
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

      console.log('📤 Отправляем запрос в Тинькофф:', {
        url: paymentConfig.apiUrl + 'Init',
        data: { ...requestData, Token: '[СКРЫТО]' }
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
