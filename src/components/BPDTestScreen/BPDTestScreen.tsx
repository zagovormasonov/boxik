import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBPDTest } from '../../contexts/BPDTestContext'
import { useAuth } from '../../contexts/AuthContext'
// import { usePaymentContext } from '../../contexts/PaymentContext' // Убрано, так как теперь всегда переходим на лендинг
import { useSaveBPDTestResult } from '../../shared/hooks/useSaveBPDTestResult'
import ProgressBar from '../ProgressBar/ProgressBar'
import BPDQuestionCard from '../BPDQuestionCard/BPDQuestionCard'
import Navigation from '../Navigation/Navigation'

const BPDTestScreen: React.FC = () => {
  const { state, questions, dispatch, severity } = useBPDTest()
  const { authState } = useAuth()
  // const { hasPaid } = usePaymentContext() // Убрано, так как теперь всегда переходим на лендинг
  const navigate = useNavigate()
  const { saveBPDTestResult, error: saveError } = useSaveBPDTestResult()

  const currentQuestion = questions[state.currentQuestion]
  const selectedAnswer = state.answers[state.currentQuestion]

  useEffect(() => {
    console.log('BPDTestScreen: Компонент загружен')
    console.log('BPDTestScreen: Состояние авторизации:', authState.user ? 'авторизован' : 'не авторизован')
    
    // Создаем session_id для неавторизованных пользователей
    if (!authState.user) {
      let sessionId = localStorage.getItem('session_id')
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
        localStorage.setItem('session_id', sessionId)
        console.log('BPDTestScreen: Создан session_id для неавторизованного пользователя:', sessionId)
      } else {
        console.log('BPDTestScreen: Используем существующий session_id:', sessionId)
      }
    }
  }, [authState.user])

  const handleAnswerSelect = (answer: number) => {
    dispatch({ 
      type: 'ANSWER_QUESTION', 
      questionId: state.currentQuestion, 
      answer 
    })
  }

  const handleNext = async () => {
    console.log('BPDTestScreen: handleNext вызван, текущий вопрос:', state.currentQuestion, 'из', questions.length)
    
    if (state.currentQuestion === questions.length - 1) {
      console.log('BPDTestScreen: Завершаем тест')
      dispatch({ type: 'COMPLETE_TEST' })
      
      // Если пользователь авторизован, сохраняем результаты и переходим в профиль
      if (authState.user?.id) {
        console.log('BPDTestScreen: Пользователь авторизован, сохраняем результаты для:', authState.user.id)
        try {
          console.log('BPDTestScreen: Сохраняем результаты теста БПД для авторизованного пользователя')
          
          const completedTestState = {
            ...state,
            isCompleted: true
          }

          const saveResult = await saveBPDTestResult({
            userId: authState.user.id,
            testState: completedTestState,
            totalQuestions: questions.length
          })
          console.log('BPDTestScreen: Результат сохранения БПД теста:', saveResult)
          
          if (saveResult) {
            console.log('BPDTestScreen: Результаты БПД теста успешно сохранены')
          } else {
            console.warn('BPDTestScreen: Не удалось сохранить результаты БПД теста')
          }
          
          // После завершения теста всегда переходим на лендинг оплаты
          console.log('BPDTestScreen: Тест завершен, переходим на лендинг оплаты')
          navigate('/subscription')
        } catch (error) {
          console.error('BPDTestScreen: Ошибка при сохранении результатов БПД теста:', error)
          // При ошибке сохранения все равно переходим на лендинг
          navigate('/subscription')
        }
      } else {
        // Если пользователь не авторизован, сохраняем результаты с session_id
        console.log('BPDTestScreen: Пользователь НЕ авторизован, сохраняем результаты с session_id')
        try {
          console.log('BPDTestScreen: Сохраняем результаты теста БПД для неавторизованного пользователя')
          
          const sessionId = localStorage.getItem('session_id') || 'anonymous'
          
          const completedTestState = {
            ...state,
            isCompleted: true
          }

          // Создаем валидный UUID для неавторизованных пользователей
          const anonymousUserId = `anonymous_${sessionId.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`
          console.log('BPDTestScreen: Создаем анонимный user_id:', anonymousUserId, 'из session_id:', sessionId)
          console.log('BPDTestScreen: sessionId тип:', typeof sessionId, 'длина:', sessionId?.length)
          console.log('BPDTestScreen: anonymousUserId тип:', typeof anonymousUserId, 'длина:', anonymousUserId?.length)
          
          const saveResult = await saveBPDTestResult({
            userId: anonymousUserId, // Используем созданный UUID для неавторизованных пользователей
            testState: completedTestState,
            totalQuestions: questions.length
          })
          console.log('BPDTestScreen: Результат сохранения БПД теста с анонимным user_id:', saveResult)
          console.log('BPDTestScreen: saveResult тип:', typeof saveResult, 'значение:', saveResult)
          
          if (saveResult) {
            console.log('BPDTestScreen: Результаты БПД теста успешно сохранены с анонимным user_id:', anonymousUserId)
            // Сохраняем связь между sessionId и anonymousUserId в localStorage
            localStorage.setItem('anonymous_user_id', anonymousUserId)
            localStorage.setItem('session_id', sessionId)
            // Дополнительно сохраняем в sessionStorage для надежности
            sessionStorage.setItem('anonymous_user_id', anonymousUserId)
            sessionStorage.setItem('session_id', sessionId)
            console.log('BPDTestScreen: Связь сохранена в localStorage и sessionStorage:', { sessionId, anonymousUserId })
            console.log('BPDTestScreen: Проверяем сохранение в localStorage:', {
              anonymous_user_id: localStorage.getItem('anonymous_user_id'),
              session_id: localStorage.getItem('session_id')
            })
            console.log('BPDTestScreen: Проверяем сохранение в sessionStorage:', {
              anonymous_user_id: sessionStorage.getItem('anonymous_user_id'),
              session_id: sessionStorage.getItem('session_id')
            })
          } else {
            console.warn('BPDTestScreen: Не удалось сохранить результаты БПД теста с анонимным user_id:', anonymousUserId)
          }
        } catch (error) {
          console.error('BPDTestScreen: Ошибка при сохранении результатов БПД теста для неавторизованного пользователя:', error)
        }
        
        // Переходим на лендинг подписки
        console.log('BPDTestScreen: Пользователь не авторизован, переходим на лендинг подписки')
        navigate('/subscription')
      }
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  }

  const handlePrevious = () => {
    dispatch({ type: 'PREV_QUESTION' })
  }


  // Обработка завершения теста
  useEffect(() => {
    if (state.isCompleted) {
      console.log('BPDTestScreen: Тест завершен, перенаправляем на лендинг подписки')
      navigate('/subscription')
    }
  }, [state.isCompleted, navigate])

  if (state.isCompleted) {
    return (
      <div className="test-screen">
        <div className="test-container">
          <div className="test-completion">
            <h2>Тест завершен!</h2>
            <p>Спасибо за прохождение теста. Ваши ответы сохранены.</p>
            <p>Перенаправляем на страницу подписки...</p>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="test-screen">
      <div className="test-container">
        <div className="test-header">
          <h1>Тест на пограничное расстройство личности (БПД)</h1>
          <p className="test-description">
            Этот тест основан на официальных критериях DSM-5 для диагностики пограничного расстройства личности.
            Отвечайте честно для получения наиболее точных результатов.
          </p>
        </div>

        <ProgressBar current={state.currentQuestion + 1} total={questions.length} />

        <div className="test-content">
          <div className="question-counter">
            Вопрос {state.currentQuestion + 1} из {questions.length}
          </div>

          <BPDQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
          />

          <Navigation
            currentQuestion={state.currentQuestion}
            totalQuestions={questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoNext={selectedAnswer !== -1}
          />

          {saveError && (
            <div className="error-message">
              <p>Ошибка при сохранении результатов: {saveError}</p>
            </div>
          )}

          <div className="test-info">
            <p><strong>Текущий уровень выраженности:</strong> {getSeverityText(severity)}</p>
            <p><strong>Общий балл:</strong> {state.totalScore}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Функция для получения текстового описания уровня выраженности
const getSeverityText = (severity: string): string => {
  switch (severity) {
    case 'none':
      return 'Отсутствие симптомов'
    case 'mild':
      return 'Легкая выраженность'
    case 'moderate':
      return 'Умеренная выраженность'
    case 'severe':
      return 'Тяжелая выраженность'
    default:
      return 'Не определено'
  }
}

export default BPDTestScreen
