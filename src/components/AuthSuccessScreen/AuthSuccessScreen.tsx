import React, { useState, useEffect } from 'react'
import { CreditCard, User, Mail, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePayment } from '../../shared/hooks/usePayment'
import { usePaymentContext } from '../../contexts/PaymentContext'
import { useNavigate } from 'react-router-dom'

const AuthSuccessScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const { authState } = useAuth()
  const { createPayment } = usePayment()
  const { hasPaid } = usePaymentContext()
  const navigate = useNavigate()

  console.log('AuthSuccessScreen: Компонент загружен, authState.user:', authState.user?.id, 'hasPaid:', hasPaid)

  // Проверяем, не оплатил ли пользователь уже
  useEffect(() => {
    if (hasPaid) {
      console.log('AuthSuccessScreen: Пользователь уже оплатил, перенаправляем в ЛК')
      navigate('/profile')
    }
  }, [hasPaid, navigate])

  const handlePay = async () => {
    if (!authState.user?.id) {
      console.error('Пользователь не авторизован')
      alert('Ошибка авторизации. Попробуйте еще раз.')
      return
    }

    setIsProcessing(true)
    
    try {
      console.log('AuthSuccessScreen: Создаем платеж для пользователя:', authState.user.id)
      
      const paymentResult = await createPayment({
        amount: 100, // 1 рубль в копейках
        description: 'Полный доступ к результатам теста БПД',
        userId: authState.user.id
      })
      
      if (paymentResult.success && paymentResult.paymentUrl) {
        console.log('AuthSuccessScreen: Перенаправляем на оплату:', paymentResult.paymentUrl)
        window.location.href = paymentResult.paymentUrl
      } else {
        console.error('AuthSuccessScreen: Ошибка при создании платежа:', paymentResult.error)
        alert('Ошибка при создании платежа. Попробуйте еще раз.')
      }
    } catch (error) {
      console.error('AuthSuccessScreen: Ошибка при создании платежа:', error)
      alert('Произошла ошибка при создании платежа. Попробуйте еще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!authState.user) {
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
          <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
            Ошибка авторизации
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Пользователь не найден. Попробуйте авторизоваться снова.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Заголовок */}
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
        
        <h1 style={{ 
          margin: '0 0 10px 0', 
          color: '#1f2937',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          Авторизация успешна!
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          margin: '0 0 30px 0',
          fontSize: '16px'
        }}>
          Добро пожаловать в Boxik
        </p>

        {/* Данные пользователя */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          margin: '0 0 30px 0',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 0 15px 0'
          }}>
            {authState.user.avatar && (
              <img 
                src={authState.user.avatar} 
                alt="Аватар" 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  marginRight: '15px',
                  border: '3px solid #e2e8f0'
                }}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <User size={16} style={{ marginRight: '8px', color: '#6b7280' }} />
                <span style={{ fontWeight: '600', color: '#1f2937' }}>
                  {authState.user.name}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <Mail size={16} style={{ marginRight: '8px', color: '#6b7280' }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  {authState.user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о подписке */}
        <div style={{
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '16px',
          margin: '0 0 24px 0',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: '#334155',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Получите полный доступ
          </h3>
          <p style={{ 
            margin: '0', 
            color: '#64748b',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            Персональный план • Рекомендации специалистов • PDF-отчет • Пожизненный доступ
          </p>
        </div>

        {/* Кнопка оплаты */}
        <button
          onClick={handlePay}
          disabled={isProcessing}
          style={{
            width: '100%',
            background: isProcessing 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
            }
          }}
          onMouseOut={(e) => {
            if (!isProcessing) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
            }
          }}
        >
          <CreditCard size={20} />
          {isProcessing ? 'Обрабатываем...' : 'Оплатить 1₽'}
        </button>

        <p style={{ 
          color: '#9ca3af', 
          fontSize: '12px', 
          margin: '15px 0 0 0' 
        }}>
          Безопасная оплата через Тинькофф
        </p>
      </div>
    </div>
  )
}

export default AuthSuccessScreen
