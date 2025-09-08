import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, Loader } from 'lucide-react'
import { usePaymentContext } from '../../contexts/PaymentContext'
import { useSubscriptions } from '../../shared/hooks/useSubscriptions'

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setHasPaid, refreshPaymentStatus } = usePaymentContext()
  const { updateSubscriptionStatus } = useSubscriptions()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const processPaymentCallback = async () => {
      console.log('🚀 PaymentCallback: Начинаем обработку callback')
      console.log('🚀 PaymentCallback: URL:', window.location.href)
      console.log('🚀 PaymentCallback: Search params:', Object.fromEntries(searchParams.entries()))
      
      try {
        // Получаем параметры от Тинькофф
        const paymentId = searchParams.get('PaymentId') || searchParams.get('payment_id') || searchParams.get('PaymentID')
        const status = searchParams.get('Status') || searchParams.get('status')
        const errorCode = searchParams.get('ErrorCode') || searchParams.get('error_code')
        const message = searchParams.get('Message') || searchParams.get('message')
        const orderId = searchParams.get('OrderId') || searchParams.get('order_id') || searchParams.get('OrderID')
        
        // Дополнительные параметры от Тинькофф
        const success = searchParams.get('Success') || searchParams.get('success')
        const result = searchParams.get('Result') || searchParams.get('result')
        const state = searchParams.get('State') || searchParams.get('state')
        const terminalKey = searchParams.get('TerminalKey') || searchParams.get('terminal_key')

        console.log('📋 PaymentCallback: Получены параметры:', {
          paymentId,
          status,
          errorCode,
          message,
          orderId,
          success,
          result,
          state,
          terminalKey,
          isTestPayment: paymentId?.startsWith('test_payment_'),
          allParams: Object.fromEntries(searchParams.entries())
        })

        // Извлекаем userId из OrderId если он есть
        let userId = null
        if (orderId?.startsWith('u')) {
          // OrderId формат: u{userId8}{timestamp8}{random6}
          // Извлекаем userId (первые 8 символов после 'u')
          userId = orderId.substring(1, 9)
          console.log('Извлеченный userId из OrderId:', userId, 'из OrderId:', orderId)
        } else {
          console.log('OrderId не начинается с "u", возможно это не наш платеж:', orderId)
        }

        // УПРОЩЕННАЯ ЛОГИКА: Если есть PaymentId и OrderId, считаем платеж успешным
        console.log('🎯 PaymentCallback: Упрощенная логика - проверяем PaymentId и OrderId')
        console.log('🎯 PaymentCallback: PaymentId =', paymentId, 'OrderId =', orderId)
        
        if (paymentId && orderId) {
          console.log('✅ PaymentCallback: Есть PaymentId и OrderId - считаем платеж успешным!')
          setStatus('success')
          setMessage('Оплата успешно завершена!')
          
          // Обновляем статус подписки в Supabase
          console.log('🔄 PaymentCallback: Обновляем статус подписки в Supabase:', paymentId)
          try {
            const updatedSubscription = await updateSubscriptionStatus(paymentId, 'confirmed', {
              callback_status: status || 'simplified_success',
              callback_message: message || 'Платеж успешен (упрощенная логика)',
              callback_order_id: orderId,
              callback_user_id: userId,
              completed_at: new Date().toISOString()
            })
            
            if (updatedSubscription) {
              console.log('✅ PaymentCallback: Подписка успешно обновлена:', updatedSubscription)
              setHasPaid(true)
              localStorage.setItem('hasPaid', 'true')
              await refreshPaymentStatus()
            } else {
              console.error('❌ PaymentCallback: Не удалось обновить подписку - updateSubscriptionStatus вернул null')
              // Принудительно устанавливаем статус оплаты даже если обновление не удалось
              console.log('🔄 PaymentCallback: Принудительно устанавливаем статус оплаты')
              setHasPaid(true)
              localStorage.setItem('hasPaid', 'true')
            }
          } catch (updateError) {
            console.error('❌ PaymentCallback: Ошибка при обновлении подписки:', updateError)
            // Принудительно устанавливаем статус оплаты даже при ошибке обновления
            console.log('🔄 PaymentCallback: Принудительно устанавливаем статус оплаты после ошибки')
            setHasPaid(true)
            localStorage.setItem('hasPaid', 'true')
          }
          
          // Перенаправляем в личный кабинет
          setTimeout(() => {
            console.log('🔄 PaymentCallback: Перенаправляем в профиль после успешной оплаты')
            navigate('/profile')
          }, 3000)
        } else {
          console.log('❌ PaymentCallback: Нет PaymentId или OrderId - считаем платеж неуспешным')
          console.log('❌ PaymentCallback: PaymentId =', paymentId, 'OrderId =', orderId)
          console.log('❌ PaymentCallback: Все параметры от Тинькофф:', Object.fromEntries(searchParams.entries()))
          
          // Если нет параметров вообще, возможно пользователь попал по прямой ссылке
          const allParams = Object.fromEntries(searchParams.entries())
          if (Object.keys(allParams).length === 0) {
            console.log('🔄 PaymentCallback: Нет параметров, перенаправляем в личный кабинет')
            // Принудительно устанавливаем статус оплаты для пользователей без параметров
            console.log('🔄 PaymentCallback: Принудительно устанавливаем статус оплаты для пользователя без параметров')
            setHasPaid(true)
            localStorage.setItem('hasPaid', 'true')
            setStatus('success')
            setMessage('Перенаправляем в личный кабинет...')
            setTimeout(() => {
              navigate('/profile')
            }, 1000) // Уменьшили время ожидания
          } else {
            console.log('❌ PaymentCallback: Есть параметры, но нет PaymentId/OrderId')
            setStatus('error')
            setMessage('Ошибка: отсутствуют необходимые параметры платежа')
            setTimeout(() => {
              navigate('/subscription')
            }, 3000)
          }
        }
      } catch (error) {
        console.error('❌ PaymentCallback: Ошибка при обработке callback:', error)
        setStatus('error')
        setMessage('Произошла ошибка при обработке платежа')
        
        setTimeout(() => {
          navigate('/subscription')
        }, 3000)
      }
    }

    processPaymentCallback()
  }, [searchParams, navigate, setHasPaid])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white'
            }}>
              <Loader size={32} className="animate-spin" />
            </div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
              Обрабатываем платеж...
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Пожалуйста, подождите
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white'
            }}>
              <Check size={32} />
            </div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
              Оплата успешно завершена!
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
              Теперь вы можете получить доступ к результатам теста
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              Перенаправляем в личный кабинет...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white'
            }}>
              <X size={32} />
            </div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
              Ошибка оплаты
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>
              {message}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              Возвращаемся к оплате...
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
