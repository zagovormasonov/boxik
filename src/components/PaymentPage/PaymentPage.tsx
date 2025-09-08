import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Shield, Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePayment } from '../../shared/hooks/usePayment'
import SupabaseDiagnostics from '../SupabaseDiagnostics/SupabaseDiagnostics'

const PaymentPage: React.FC = () => {
  const navigate = useNavigate()
  const { authState } = useAuth()
  const { createPayment, isProcessing, error } = usePayment()
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  // Проверяем авторизацию
  useEffect(() => {
    if (!authState.user) {
      console.log('PaymentPage: Пользователь не авторизован, перенаправляем на лендинг')
      navigate('/subscription')
    }
  }, [authState.user, navigate])

  const handlePayment = async () => {
    if (!authState.user) return

    setIsCreatingPayment(true)
    
    try {
      console.log('Создаем платеж для авторизованного пользователя:', {
        userId: authState.user.id,
        userEmail: authState.user.email,
        userName: authState.user.name
      })

      const result = await createPayment({
        amount: 1,
        description: 'Полный доступ к результатам психологического теста БПД',
        userId: authState.user.id,
        userEmail: authState.user.email
      })

      if (result.success && result.paymentUrl) {
        console.log('Платеж успешно создан, перенаправляем на оплату:', result)
        window.location.href = result.paymentUrl
      } else {
        console.error('Ошибка при создании платежа:', result.error)
      }
    } catch (err) {
      console.error('Ошибка при обработке платежа:', err)
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handleBackToLanding = () => {
    navigate('/subscription')
  }

  if (!authState.user) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Проверяем авторизацию...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Заголовок */}
        <div className="payment-header">
          <button 
            onClick={handleBackToLanding}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Назад к подписке
          </button>
          
          <div className="success-icon">
            <Check size={40} />
          </div>
          <h1 className="payment-title">Оплата подписки</h1>
          <p className="payment-subtitle">
            Добро пожаловать, {authState.user.name}! Теперь вы можете оплатить подписку и получить полный доступ к результатам теста.
          </p>
        </div>

        {/* Информация о пользователе */}
        <div className="user-info-card">
          <h3>Информация о пользователе</h3>
          <div className="user-details">
            <div className="user-detail">
              <span className="label">Имя:</span>
              <span className="value">{authState.user.name}</span>
            </div>
            <div className="user-detail">
              <span className="label">Email:</span>
              <span className="value">{authState.user.email}</span>
            </div>
            {authState.user.avatar && (
              <div className="user-detail">
                <span className="label">Аватар:</span>
                <img src={authState.user.avatar} alt="Аватар" className="user-avatar" />
              </div>
            )}
          </div>
        </div>

        {/* Информация о подписке */}
        <div className="subscription-info-card">
          <h3>Что вы получите</h3>
          <div className="features-list">
            <div className="feature-item">
              <Check size={20} />
              <span>Детальный PDF отчет с результатами теста</span>
            </div>
            <div className="feature-item">
              <Check size={20} />
              <span>Возможность отправить результаты специалисту</span>
            </div>
            <div className="feature-item">
              <Check size={20} />
              <span>Персональные рекомендации от ChatGPT</span>
            </div>
            <div className="feature-item">
              <Check size={20} />
              <span>Пожизненный доступ к результатам</span>
            </div>
          </div>
        </div>

        {/* Цена и кнопка оплаты */}
        <div className="pricing-card">
          <div className="pricing-header">
            <h3>Полный доступ</h3>
            <div className="pricing-price">
              <span className="price-amount">1</span>
              <span className="price-currency">₽</span>
            </div>
          </div>
          
          <div className="payment-security">
            <Shield size={16} />
            <span>Безопасная оплата через СБП Тинькофф</span>
          </div>

          <button 
            onClick={handlePayment}
            disabled={isProcessing || isCreatingPayment}
            className="payment-button"
          >
            <CreditCard size={20} />
            {isProcessing || isCreatingPayment ? 'Создаем платеж...' : 'Оплатить через СБП'}
          </button>

          {error && (
            <div className="error-message">
              <p>Ошибка: {error}</p>
            </div>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="additional-info">
          <p className="info-text">
            💳 Оплата происходит через безопасную систему СБП Тинькофф
          </p>
          <p className="info-text">
            🔒 Ваши данные надежно защищены и не передаются третьим лицам
          </p>
          <p className="info-text">
            ⚡ После успешной оплаты вы сразу получите доступ ко всем функциям
          </p>
          
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {showDiagnostics ? 'Скрыть' : 'Показать'} диагностику Supabase
          </button>
        </div>

        {/* Диагностика Supabase */}
        {showDiagnostics && <SupabaseDiagnostics />}
      </div>
    </div>
  )
}

export default PaymentPage
