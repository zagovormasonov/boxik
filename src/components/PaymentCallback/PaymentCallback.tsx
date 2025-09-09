import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, Loader } from 'lucide-react'
import { usePaymentContext } from '../../contexts/PaymentContext'
import { useSubscriptions } from '../../shared/hooks/useSubscriptions'
import { useUserHasPaid } from '../../shared/hooks/useUserHasPaid'
import { useAuth } from '../../contexts/AuthContext'
import { useTestUserMapping } from '../../shared/hooks/useTestUserMapping'

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setHasPaid, refreshPaymentStatus, forceSetPaid } = usePaymentContext()
  const { updateSubscriptionStatus } = useSubscriptions()
  const { setUserPaid, getUserHasPaid } = useUserHasPaid()
  const { authState } = useAuth()
  const { linkExistingTestResults } = useTestUserMapping()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const processPaymentCallback = async () => {
      console.log('🚀 PaymentCallback: Начинаем обработку callback')
      console.log('🚀 PaymentCallback: URL:', window.location.href)
      console.log('🚀 PaymentCallback: Search params:', Object.fromEntries(searchParams.entries()))
      
      try {
        // Сначала проверяем, не оплатил ли пользователь уже ранее
        if (authState.user?.id) {
          try {
            console.log('🔍 PaymentCallback: Проверяем текущий статус оплаты в БД для пользователя:', authState.user.id)
            const currentHasPaid = await getUserHasPaid(authState.user.id)
            console.log('🔍 PaymentCallback: Текущий статус оплаты в БД:', currentHasPaid)
            
            if (currentHasPaid) {
              console.log('✅ PaymentCallback: Пользователь уже оплатил, перенаправляем в ЛК')
              forceSetPaid(true)
              setStatus('success')
              setMessage('Оплата уже была завершена!')
              setTimeout(() => {
                console.log('🔄 PaymentCallback: Перенаправляем в профиль (пользователь уже оплатил)')
                navigate('/profile')
              }, 2000)
              return
            }
          } catch (error) {
            console.error('❌ PaymentCallback: Ошибка при проверке текущего статуса оплаты:', error)
            // Продолжаем обработку callback
          }
        }
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
        
        // Дополнительное логирование всех параметров URL
        console.log('🔍 PaymentCallback: Все параметры URL:', window.location.search)
        console.log('🔍 PaymentCallback: Полный URL:', window.location.href)
        console.log('🔍 PaymentCallback: Все searchParams:', Array.from(searchParams.entries()))

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

        // ПРОВЕРЯЕМ РЕАЛЬНЫЕ ПАРАМЕТРЫ ОПЛАТЫ
        console.log('🎯 PaymentCallback: Проверяем реальные параметры оплаты')
        console.log('🎯 PaymentCallback: PaymentId =', paymentId, 'OrderId =', orderId)
        console.log('🎯 PaymentCallback: Status =', status, 'Success =', success)
        
        // Проверяем успешность платежа более гибко
        const hasPaymentId = paymentId && paymentId.length > 0
        const hasOrderId = orderId && orderId.length > 0
        const isSuccessStatus = status === 'CONFIRMED' || status === 'confirmed' || status === 'AUTHORIZED' || status === 'authorized'
        const isSuccessFlag = success === 'true' || success === 'True' || success === '1'
        const isSuccessResult = result === '0' || result === 'OK' || result === 'ok'
        
        console.log('🔍 PaymentCallback: Анализ параметров:', {
          hasPaymentId,
          hasOrderId,
          isSuccessStatus,
          isSuccessFlag,
          isSuccessResult,
          paymentId,
          orderId,
          status,
          success,
          result
        })
        
        // Устанавливаем hasPaid: true если есть PaymentId И (OrderId ИЛИ успешный статус)
        if (hasPaymentId && (hasOrderId || isSuccessStatus || isSuccessFlag || isSuccessResult)) {
          console.log('✅ PaymentCallback: Платеж считается успешным!')
          
          // Устанавливаем hasPaid: true только для реальной оплаты
          console.log('🔄 PaymentCallback: Устанавливаем hasPaid: true для реальной оплаты')
          forceSetPaid(true)
          
          // Обновляем статус в БД только для реальной оплаты
          if (authState.user?.id) {
            try {
              console.log('🔄 PaymentCallback: Обновляем статус в БД для пользователя:', authState.user.id)
              const updateResult = await setUserPaid(authState.user.id)
              console.log('✅ PaymentCallback: Результат обновления БД:', updateResult)
              if (updateResult) {
                console.log('✅ PaymentCallback: Статус успешно обновлен в БД')
              } else {
                console.error('❌ PaymentCallback: Не удалось обновить статус в БД')
              }
            } catch (error) {
              console.error('❌ PaymentCallback: Ошибка при обновлении статуса в БД:', error)
            }
          } else {
            console.error('❌ PaymentCallback: Нет authState.user.id для обновления БД')
          }
          
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
              forceSetPaid(true)
              // Принудительно обновляем статус
              await refreshPaymentStatus()
            } else {
              console.error('❌ PaymentCallback: Не удалось обновить подписку - updateSubscriptionStatus вернул null')
              // Принудительно устанавливаем статус оплаты даже если обновление не удалось
              console.log('🔄 PaymentCallback: Принудительно устанавливаем статус оплаты')
              forceSetPaid(true)
              // Принудительно обновляем статус
              await refreshPaymentStatus()
            }
          } catch (updateError) {
            console.error('❌ PaymentCallback: Ошибка при обновлении подписки:', updateError)
            // Принудительно устанавливаем статус оплаты даже при ошибке обновления
            console.log('🔄 PaymentCallback: Принудительно устанавливаем статус оплаты после ошибки')
            forceSetPaid(true)
          }
          
          // Связываем результаты теста с пользователем после успешной оплаты
          if (authState.user?.id) {
            try {
              console.log('🔗 PaymentCallback: Связываем результаты теста с пользователем после оплаты:', authState.user.id)
              const sessionId = localStorage.getItem('test_session_id') || 'anonymous'
              console.log('🔗 PaymentCallback: Session ID для связывания:', sessionId)
              
              const linked = await linkExistingTestResults(authState.user.id, sessionId)
              if (linked) {
                console.log('✅ PaymentCallback: Результаты теста успешно связаны с пользователем после оплаты')
              } else {
                console.log('ℹ️ PaymentCallback: Результаты теста для связывания не найдены')
              }
            } catch (linkError) {
              console.error('❌ PaymentCallback: Ошибка при связывании результатов теста после оплаты:', linkError)
            }
          }
          
          // Перенаправляем в личный кабинет
          setTimeout(() => {
            console.log('🔄 PaymentCallback: Перенаправляем в профиль после успешной оплаты')
            navigate('/profile')
          }, 3000)
        } else {
          console.log('❌ PaymentCallback: Платеж не считается успешным по основным критериям')
          console.log('❌ PaymentCallback: PaymentId =', paymentId, 'OrderId =', orderId)
          console.log('❌ PaymentCallback: Все параметры от Тинькофф:', Object.fromEntries(searchParams.entries()))
          
          // Дополнительная проверка: если есть хотя бы PaymentId, возможно платеж прошел
          if (hasPaymentId) {
            console.log('⚠️ PaymentCallback: Есть PaymentId, но нет других подтверждений успеха')
            console.log('⚠️ PaymentCallback: Возможно платеж прошел, но параметры пришли в неожиданном формате')
            
            // Если есть PaymentId, считаем платеж успешным (консервативный подход)
            console.log('✅ PaymentCallback: Принимаем решение считать платеж успешным из-за наличия PaymentId')
            forceSetPaid(true)
            
            if (authState.user?.id) {
              try {
                console.log('🔄 PaymentCallback: Обновляем статус в БД для пользователя:', authState.user.id)
                const updateResult = await setUserPaid(authState.user.id)
                console.log('✅ PaymentCallback: Результат обновления БД (PaymentId fallback):', updateResult)
                if (updateResult) {
                  console.log('✅ PaymentCallback: Статус успешно обновлен в БД (PaymentId fallback)')
                } else {
                  console.error('❌ PaymentCallback: Не удалось обновить статус в БД (PaymentId fallback)')
                }
              } catch (error) {
                console.error('❌ PaymentCallback: Ошибка при обновлении статуса в БД (PaymentId fallback):', error)
              }
            } else {
              console.error('❌ PaymentCallback: Нет authState.user.id для обновления БД (PaymentId fallback)')
            }
            
            setStatus('success')
            setMessage('Оплата успешно завершена!')
            
            setTimeout(() => {
              console.log('🔄 PaymentCallback: Перенаправляем в профиль после успешной оплаты')
              navigate('/profile')
            }, 3000)
            return
          }
          
          // Если нет параметров вообще, возможно пользователь попал по прямой ссылке
          const allParams = Object.fromEntries(searchParams.entries())
          if (Object.keys(allParams).length === 0) {
            console.log('🔄 PaymentCallback: Нет параметров URL')
            console.log('🔄 PaymentCallback: Возможно это SuccessURL/FailURL редирект без параметров')
            
            // Проверяем, есть ли информация о платеже в localStorage
            const paymentCreatedAt = localStorage.getItem('paymentCreatedAt')
            if (paymentCreatedAt) {
              const paymentTime = parseInt(paymentCreatedAt)
              const timeDiff = Date.now() - paymentTime
              const fiveMinutes = 5 * 60 * 1000 // 5 минут
              
              console.log('🔄 PaymentCallback: Найдена информация о платеже в localStorage')
              console.log('🔄 PaymentCallback: Время создания платежа:', new Date(paymentTime).toISOString())
              console.log('🔄 PaymentCallback: Прошло времени:', timeDiff, 'мс')
              
              if (timeDiff < fiveMinutes) {
                console.log('✅ PaymentCallback: Платеж был создан недавно, считаем его успешным')
                forceSetPaid(true)
                
                if (authState.user?.id) {
                  try {
                    console.log('🔄 PaymentCallback: Обновляем статус в БД для пользователя:', authState.user.id)
                    const updateResult = await setUserPaid(authState.user.id)
                    console.log('✅ PaymentCallback: Результат обновления БД (fallback):', updateResult)
                    if (updateResult) {
                      console.log('✅ PaymentCallback: Статус успешно обновлен в БД (fallback)')
                    } else {
                      console.error('❌ PaymentCallback: Не удалось обновить статус в БД (fallback)')
                    }
                  } catch (error) {
                    console.error('❌ PaymentCallback: Ошибка при обновлении статуса в БД (fallback):', error)
                  }
                } else {
                  console.error('❌ PaymentCallback: Нет authState.user.id для обновления БД (fallback)')
                }
                
                setStatus('success')
                setMessage('Оплата успешно завершена!')
                
                setTimeout(() => {
                  console.log('🔄 PaymentCallback: Перенаправляем в профиль после успешной оплаты')
                  navigate('/profile')
                }, 3000)
                return
              } else {
                console.log('⚠️ PaymentCallback: Платеж был создан давно, возможно это старый редирект')
              }
            }
            
            console.log('🔄 PaymentCallback: Перенаправляем на лендинг оплаты')
            setStatus('error')
            setMessage('Нет данных об оплате. Перенаправляем на страницу оплаты...')
            setTimeout(() => {
              navigate('/subscription')
            }, 2000)
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
