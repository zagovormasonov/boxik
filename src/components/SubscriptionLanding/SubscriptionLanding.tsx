import React from 'react'
import { Check, Star, Shield, FileText, Send, CreditCard } from 'lucide-react'
import PaymentModal from '../PaymentModal/PaymentModal'
import YandexAuth from '../YandexAuth/YandexAuth'
import { usePaymentContext } from '../../contexts/PaymentContext'
import { useAuth } from '../../contexts/AuthContext'

const SubscriptionLanding: React.FC = () => {
  const { paymentModalOpen, setPaymentModalOpen } = usePaymentContext()
  const { authState } = useAuth()

  const handlePurchaseSubscription = () => {
    if (!authState.user) {
      console.log('Пользователь не авторизован, необходимо войти через Яндекс')
      return
    }
    setPaymentModalOpen(true)
  }

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false)
  }

  const advantages = [
    {
      icon: <FileText size={24} />,
      title: "Детальный PDF отчет",
      description: "Получите подробный анализ ваших результатов с рекомендациями"
    },
    {
      icon: <Send size={24} />,
      title: "Отправка специалисту",
      description: "Поделитесь результатами с психологом для консультации"
    },
    {
      icon: <Shield size={24} />,
      title: "Конфиденциальность",
      description: "Ваши данные защищены и не передаются третьим лицам"
    },
    {
      icon: <Star size={24} />,
      title: "Профессиональная оценка",
      description: "Тест основан на официальных критериях DSM-5"
    }
  ]

  return (
    <div className="subscription-landing">
      <div className="landing-container">
        {/* Заголовок */}
        <div className="landing-header">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h1 className="landing-title">
            Тест завершен!
          </h1>
          <p className="landing-subtitle">
            Получите полный доступ к результатам и рекомендациям
          </p>
        </div>

        {/* Преимущества подписки */}
        <div className="advantages-section">
          <h2 className="advantages-title">
            Что вы получите с подпиской:
          </h2>
          
          <div className="advantages-grid">
            {advantages.map((advantage, index) => (
              <div key={index} className="advantage-card">
                <div className="advantage-icon">
                  {advantage.icon}
                </div>
                <div className="advantage-content">
                  <h3 className="advantage-title">
                    {advantage.title}
                  </h3>
                  <p className="advantage-description">
                    {advantage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Цена и кнопка */}
        <div className="pricing-section">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Полный доступ</h3>
              <div className="pricing-price">
                <span className="price-amount">200</span>
                <span className="price-currency">₽</span>
              </div>
            </div>
            
            <div className="pricing-features">
              <div className="feature-item">
                <Check size={16} />
                <span>Детальный PDF отчет</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Отправка результатов специалисту</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Персональные рекомендации</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Пожизненный доступ к результатам</span>
              </div>
            </div>

            {authState.user ? (
              <button 
                onClick={handlePurchaseSubscription}
                className="purchase-button"
              >
                <CreditCard size={20} />
                Приобрести подписку
              </button>
            ) : (
              <div className="auth-required-section">
                <p className="auth-required-text">
                  Для покупки подписки необходимо войти через Яндекс
                </p>
                <YandexAuth />
              </div>
            )}
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="additional-info">
          <p className="info-text">
            💳 Безопасная оплата через СБП Тинькофф
          </p>
          <p className="info-text">
            🔒 Ваши данные защищены и конфиденциальны
          </p>
        </div>
      </div>

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        amount={200}
        description="Полный доступ к результатам психологического теста БПД"
        userId={authState.user?.id}
        userEmail={authState.user?.email}
      />
    </div>
  )
}

export default SubscriptionLanding
