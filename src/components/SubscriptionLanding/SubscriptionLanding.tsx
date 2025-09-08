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
    <div className="page-with-bg">
      <div className="page-content">
        {/* Заголовок */}
        <div className="text-center mb-lg">
          <div className="flex-center mb-md">
            <div className="w-20 h-20 bg-success rounded-full flex-center text-white">
              <Check size={48} />
            </div>
          </div>
          <h1 className="title-lg text-center">
            Тест завершен!
          </h1>
          <p className="subtitle text-center">
            Получи персональный план действий и помощь в поиске психолога
          </p>
        </div>

        {/* Преимущества подписки */}
        <div className="mb-xl">
          <h2 className="title text-center mb-lg">
            Что ты получишь с подпиской:
          </h2>
          
          <div className="grid grid-auto gap-md">
            {advantages.map((advantage, index) => (
              <div key={index} className="card card-compact">
                <div className="flex gap">
                  <div className="w-12 h-12 bg-accent-color rounded-md flex-center text-white flex-shrink-0">
                    {advantage.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="title-sm mb-sm">
                      {advantage.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Цена и кнопка */}
        <div className="card-elevated">
          <div className="text-center mb-lg">
            <h3 className="title mb-sm">Полный доступ</h3>
            <div className="flex-center gap-sm">
              <span className="text-3xl font-bold">1</span>
              <span className="text-xl font-medium">₽</span>
            </div>
          </div>
          
          <div className="space-y-sm mb-lg">
            <div className="flex-center gap-sm">
              <Check size={16} />
              <span>Получи персональный план</span>
            </div>
            <div className="flex-center gap-sm">
              <Check size={16} />
              <span>Подберём психолога под твой случай</span>
            </div>
            <div className="flex-center gap-sm">
              <Check size={16} />
              <span>Подготовим к сеансу</span>
            </div>
            <div className="flex-center gap-sm">
              <Check size={16} />
              <span>Подготовим PDF для психолога</span>
            </div>
            <div className="flex-center gap-sm">
              <Check size={16} />
              <span>Обратная связь после сеанса</span>
            </div>
          </div>

          <button 
            onClick={handleLoginAndPay}
            disabled={isProcessing}
            className="btn btn-primary btn-full btn-lg"
          >
            <CreditCard size={20} />
            {isProcessing ? 'Перенаправляем...' : 'Войти через Яндекс и оплатить 1₽'}
          </button>
        </div>

        {/* Дополнительная информация */}
        <div className="text-center space-y-sm">
          <p className="text-sm text-gray-500">
            💳 Безопасная оплата через СБП Тинькофф
          </p>
          <p className="text-sm text-gray-500">
            🔒 Ваши данные защищены и конфиденциальны
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionLanding
