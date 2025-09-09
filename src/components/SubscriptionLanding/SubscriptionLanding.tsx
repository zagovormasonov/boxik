import React, { useState, useEffect } from 'react'
import { Check, Star, Shield, FileText, Send, CreditCard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { usePayment } from '../../shared/hooks/usePayment'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Advantage {
  icon: React.ReactNode
  title: string
  description: string
  subpoints?: string[]
}

const SubscriptionLanding: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const { authState } = useAuth()
  const { createPayment } = usePayment()
  const navigate = useNavigate()

  // Проверяем статус оплаты для авторизованных пользователей
  useEffect(() => {
    const checkUserPaymentStatus = async () => {
      if (authState.user?.id) {
        console.log('SubscriptionLanding: Проверяем статус оплаты для авторизованного пользователя:', authState.user.id)
        
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('haspaid')
            .eq('id', authState.user.id)
            .single()
          
          if (userError) {
            console.warn('SubscriptionLanding: Ошибка получения статуса оплаты:', userError)
            return
          }
          
          const hasPaid = userData?.haspaid === true
          console.log('SubscriptionLanding: Статус оплаты пользователя:', hasPaid)
          
          if (hasPaid) {
            console.log('SubscriptionLanding: Пользователь уже оплатил, перенаправляем в ЛК')
            navigate('/profile')
          }
        } catch (error) {
          console.error('SubscriptionLanding: Ошибка проверки статуса оплаты:', error)
        }
      }
    }

    checkUserPaymentStatus()
  }, [authState.user?.id, navigate])

  const handleLoginAndPay = async () => {
    setIsProcessing(true)
    
    try {
      // ВСЕГДА запускаем авторизацию через Яндекс
      console.log('Запускаем авторизацию через Яндекс')
      
      const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${import.meta.env.VITE_YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/yandex/callback')}&scope=login:email+login:info&state=${encodeURIComponent('/subscription')}&force_confirm=true`
      
      console.log('Перенаправляем на авторизацию Яндекс:', yandexAuthUrl)
      window.location.href = yandexAuthUrl
    } catch (error) {
      console.error('Ошибка при авторизации:', error)
      alert('Произошла ошибка при авторизации. Попробуйте еще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePay = async () => {
    if (!authState.user?.id) {
      console.error('Пользователь не авторизован')
      alert('Сначала необходимо авторизоваться')
      return
    }

    setIsProcessing(true)
    
    try {
      console.log('Создаем платеж для авторизованного пользователя:', authState.user.id)
      
      const paymentResult = await createPayment({
        amount: 100, // 1 рубль в копейках
        description: 'Полный доступ к результатам теста БПД',
        userId: authState.user.id
      })
      
      if (paymentResult.success && paymentResult.paymentUrl) {
        console.log('Перенаправляем на оплату:', paymentResult.paymentUrl)
        window.location.href = paymentResult.paymentUrl
      } else {
        console.error('Ошибка при создании платежа:', paymentResult.error)
        alert('Ошибка при создании платежа. Попробуйте еще раз.')
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error)
      alert('Произошла ошибка при создании платежа. Попробуйте еще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  const advantages: Advantage[] = [
    {
      icon: <FileText size={24} />,
      title: "Получи персональный план",
      description: "Что делать именно в твоём случае",
      subpoints: [
        "Конкретные действия",
        "Какие тесты ещё пройти в твоём случае",
        "Какой метод терапии использовать?",
        "Какой нужен психолог"
      ]
    },
    {
      icon: <Send size={24} />,
      title: "Подберём психолога под твой случай",
      description: "Найдём специалиста, который лучше всего подходит именно тебе"
    },
    {
      icon: <Shield size={24} />,
      title: "Подготовим к сеансу",
      description: "Всё необходимое для эффективной работы с психологом",
      subpoints: [
        "Что сказать специалисту в твоём случае",
        "Как на первом сеансе определить, что он скорее всего тебе подходит?"
      ]
    },
    {
      icon: <Star size={24} />,
      title: "Подготовим PDF для психолога",
      description: "Даёшь его психологу, и понимает, что делать в твоём случае"
    },
    {
      icon: <Check size={24} />,
      title: "Обратная связь после сеанса",
      description: "Ты сможешь поделиться с нами, как прошёл сеанс у психолога, и мы дадим обратную связь"
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
                  {advantage.subpoints && (
                    <ul className="advantage-subpoints">
                      {advantage.subpoints.map((subpoint, subIndex) => (
                        <li key={subIndex} className="subpoint-item">
                          {subpoint}
                        </li>
                      ))}
                    </ul>
                  )}
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
                onClick={handlePay}
                disabled={isProcessing}
                className="purchase-button"
              >
                <CreditCard size={20} />
                {isProcessing ? 'Обрабатываем...' : 'Оплатить 1₽'}
              </button>
            ) : (
              <button 
                onClick={handleLoginAndPay}
                disabled={isProcessing}
                className="purchase-button login-and-pay-button"
              >
                <CreditCard size={20} />
                {isProcessing ? 'Перенаправляем...' : 'Войти через Яндекс и оплатить 1₽'}
              </button>
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
    </div>
  )
}

export default SubscriptionLanding
