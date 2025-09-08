import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, Loader } from 'lucide-react'
import { usePaymentContext } from '../../contexts/PaymentContext'

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setHasPaid } = usePaymentContext()
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
          orderId
        })

        // Извлекаем userId из OrderId если он есть
        const userId = orderId?.startsWith('user_') ? orderId.split('_')[1] : null
        console.log('Извлеченный userId из OrderId:', userId)

        // Проверяем статус платежа
        if (status === 'CONFIRMED' || status === 'AUTHORIZED') {
          // Платеж успешен
          setStatus('success')
          setMessage('Оплата успешно завершена!')
          setHasPaid(true)
          
          // Перенаправляем на авторизацию через 2 секунды
          setTimeout(() => {
            navigate('/auth')
          }, 2000)
        } else if (status === 'REJECTED' || status === 'CANCELLED') {
          // Платеж отклонен или отменен
          setStatus('error')
          setMessage(message || 'Платеж был отклонен или отменен')
          
          // Перенаправляем на лендинг через 3 секунды
          setTimeout(() => {
            navigate('/subscription')
          }, 3000)
        } else {
          // Неизвестный статус
          setStatus('error')
          setMessage('Неизвестный статус платежа')
          
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
              Перенаправляем на авторизацию...
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
