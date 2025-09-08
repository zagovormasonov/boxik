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
      try {
        // Получаем параметры от Тинькофф
        const paymentId = searchParams.get('PaymentId')
        const status = searchParams.get('Status')
        const errorCode = searchParams.get('ErrorCode')
        const message = searchParams.get('Message')
        const orderId = searchParams.get('OrderId')

        console.log('Обрабатываем callback от Тинькофф:', {
          paymentId,
          status,
          errorCode,
          message,
          orderId,
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

        // Проверяем статус платежа
        console.log('🔍 Проверяем статус платежа:', status)
        if (status === 'CONFIRMED' || status === 'AUTHORIZED' || status === 'COMPLETED' || status === 'SUCCESS') {
          // Платеж успешен
          console.log('✅ Платеж успешен, статус:', status)
          setStatus('success')
          setMessage('Оплата успешно завершена!')
          
          // Обновляем статус подписки в Supabase
          if (paymentId) {
            console.log('🔄 Обновляем статус подписки в Supabase:', paymentId)
            try {
              const updatedSubscription = await updateSubscriptionStatus(paymentId, 'confirmed', {
                callback_status: status,
                callback_message: message,
                callback_order_id: orderId,
                callback_user_id: userId,
                completed_at: new Date().toISOString()
              })
              
              if (updatedSubscription) {
                console.log('✅ Подписка успешно обновлена:', updatedSubscription)
                // Принудительно обновляем состояние оплаты
                setHasPaid(true)
                // Обновляем localStorage
                localStorage.setItem('hasPaid', 'true')
                // Принудительно обновляем статус из Supabase
                await refreshPaymentStatus()
              } else {
                console.error('❌ Не удалось обновить подписку - updateSubscriptionStatus вернул null')
              }
            } catch (updateError) {
              console.error('❌ Ошибка при обновлении подписки:', updateError)
            }
          } else {
            console.error('❌ PaymentId отсутствует, не можем обновить подписку')
          }
          
          // Перенаправляем в личный кабинет через 3 секунды (увеличиваем время для обновления состояния)
          setTimeout(() => {
            console.log('🔄 Перенаправляем в профиль после успешной оплаты')
            navigate('/profile')
          }, 3000)
        } else if (status === 'REJECTED' || status === 'CANCELLED') {
          // Платеж отклонен или отменен
          console.log('❌ Платеж отклонен или отменен, статус:', status)
          setStatus('error')
          setMessage(message || 'Платеж был отклонен или отменен')
          
          // Обновляем статус подписки в Supabase
          if (paymentId) {
            console.log('Обновляем статус подписки в Supabase (отклонено):', paymentId)
            await updateSubscriptionStatus(paymentId, 'cancelled', {
              callback_status: status,
              callback_message: message,
              callback_order_id: orderId,
              callback_user_id: userId,
              completed_at: new Date().toISOString()
            })
          }
          
          // Перенаправляем на лендинг через 3 секунды
          setTimeout(() => {
            navigate('/subscription')
          }, 3000)
        } else {
          // Неизвестный статус
          console.log('⚠️ Неизвестный статус платежа:', status)
          setStatus('error')
          setMessage(`Неизвестный статус платежа: ${status}`)
          
          // Обновляем статус подписки в Supabase
          if (paymentId) {
            console.log('Обновляем статус подписки в Supabase (неизвестно):', paymentId)
            await updateSubscriptionStatus(paymentId, 'failed', {
              callback_status: status,
              callback_message: message,
              callback_order_id: orderId,
              callback_user_id: userId,
              completed_at: new Date().toISOString()
            })
          }
          
          setTimeout(() => {
            navigate('/subscription')
          }, 3000)
        }
      } catch (error) {
        console.error('Ошибка при обработке callback:', error)
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
