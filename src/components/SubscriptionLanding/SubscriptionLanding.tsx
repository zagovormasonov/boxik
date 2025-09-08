import React, { useState } from 'react'
import { Check, Star, Shield, FileText, Send, CreditCard } from 'lucide-react'

const SubscriptionLanding: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleLoginAndPay = async () => {
    // Всегда запускаем авторизацию через Яндекс с обязательным выбором аккаунта
    setIsProcessing(true)
    
    // Создаем URL для авторизации через Яндекс с редиректом на страницу оплаты
    // Добавляем force_confirm=true для обязательного выбора аккаунта
    const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${import.meta.env.VITE_YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/yandex/callback')}&scope=login:email+login:info&state=${encodeURIComponent('/payment')}&force_confirm=true`
    
    console.log('Перенаправляем на авторизацию Яндекс с обязательным выбором аккаунта:', yandexAuthUrl)
    window.location.href = yandexAuthUrl
  }

  const advantages = [
    {
      icon: <FileText size={24} />,
      title: "Получи персональный план",
      description: "Конкретные действия, какие тесты ещё пройти в твоём случае, какой метод терапии использовать, какой нужен психолог"
    },
    {
      icon: <Send size={24} />,
      title: "Подберём психолога под твой случай",
      description: "Найдём специалиста, который лучше всего подходит именно для твоей ситуации"
    },
    {
      icon: <Shield size={24} />,
      title: "Подготовим к сеансу",
      description: "Что сказать специалисту в твоём случае, как на первом сеансе определить, что он скорее всего тебе подходит"
    },
    {
      icon: <Star size={24} />,
      title: "Подготовим PDF для психолога",
      description: "Даёшь его психологу, и понимает, что делать в твоём случае"
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
            Получи персональный план действий и помощь в поиске психолога
          </p>
        </div>

        {/* Преимущества подписки */}
        <div className="advantages-section">
          <h2 className="advantages-title">
            Что ты получишь с подпиской:
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
                <span className="price-amount">1</span>
                <span className="price-currency">₽</span>
              </div>
            </div>
            
            <div className="pricing-features">
              <div className="feature-item">
                <Check size={16} />
                <span>Получи персональный план</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Подберём психолога под твой случай</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Подготовим к сеансу</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Подготовим PDF для психолога</span>
              </div>
              <div className="feature-item">
                <Check size={16} />
                <span>Обратная связь после сеанса</span>
              </div>
            </div>

            <button 
              onClick={handleLoginAndPay}
              disabled={isProcessing}
              className="purchase-button login-and-pay-button"
            >
              <CreditCard size={20} />
              {isProcessing ? 'Перенаправляем...' : 'Войти через Яндекс и оплатить 1₽'}
            </button>
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
    </div>
  )
}

export default SubscriptionLanding
