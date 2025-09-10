import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Shield, FileText, Clock, CheckCircle } from 'lucide-react'

const TestLanding: React.FC = () => {
  const navigate = useNavigate()

  const handleStartTest = () => {
    navigate('/test')
  }

  const features = [
    {
      icon: <Brain size={24} />,
      image: '/src/img/1.png',
      title: 'Профессиональная диагностика',
      description: 'Тест основан на официальных критериях DSM-5 для диагностики пограничного расстройства личности'
    },
    {
      icon: <Shield size={24} />,
      image: '/src/img/2.png',
      title: 'Конфиденциальность',
      description: 'Все ваши ответы строго конфиденциальны и не передаются третьим лицам'
    },
    {
      icon: <FileText size={24} />,
      image: '/src/img/3.png',
      title: 'Детальный отчет',
      description: 'Получите подробный анализ результатов с рекомендациями специалистов'
    },
    {
      icon: <Clock size={24} />,
      title: 'Быстро и удобно',
      description: 'Прохождение теста займет всего 10-15 минут вашего времени'
    }
  ]

  const benefits = [
    'Определение уровня выраженности симптомов БПД',
    'Понимание собственного эмоционального состояния',
    'Рекомендации по дальнейшим действиям',
    'Возможность консультации со специалистом'
  ]

  return (
    <div className="test-landing">
      <div className="test-landing-container">
        {/* Заголовок */}
        <div className="test-landing-header">
          <h1>Тест на пограничное расстройство личности</h1>
          <p className="test-landing-subtitle">
            Получите профессиональную оценку вашего эмоционального состояния и рекомендации специалистов
          </p>
        </div>

        {/* Основные преимущества */}
        <div className="test-landing-features">
          {features.map((feature, index) => (
            <div key={index} className="test-landing-feature">
              <div className="test-landing-feature-icon">
                {feature.image ? (
                  <img src={feature.image} alt={feature.title} className="feature-image" />
                ) : (
                  feature.icon
                )}
              </div>
              <div className="test-landing-feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Что вы получите */}
        <div className="test-landing-benefits">
          <h2>Что вы получите после прохождения теста:</h2>
          <div className="test-landing-benefits-list">
            {benefits.map((benefit, index) => (
              <div key={index} className="test-landing-benefit">
                <CheckCircle size={20} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Информация о тесте */}
        <div className="test-landing-info">
          <div className="test-landing-info-card">
            <h3>О тесте</h3>
            <p>
              Этот тест основан на официальных критериях DSM-5 (Диагностическое и статистическое руководство по психическим расстройствам) 
              для диагностики пограничного расстройства личности. Отвечайте честно для получения наиболее точных результатов.
            </p>
          </div>
          
          <div className="test-landing-info-card">
            <h3>Важно помнить</h3>
            <p>
              Результаты теста носят информационный характер и не заменяют консультацию с квалифицированным специалистом. 
              При наличии серьезных симптомов рекомендуется обратиться к психологу или психиатру.
            </p>
          </div>
        </div>

        {/* Кнопка начала теста */}
        <div className="test-landing-action">
          <button 
            className="test-landing-start-button"
            onClick={handleStartTest}
          >
            Пройти тест
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestLanding
