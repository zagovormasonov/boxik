import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBPDTest } from '../../contexts/BPDTestContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSaveBPDTestResult } from '../../shared/hooks/useSaveBPDTestResult'
import ProgressBar from '../ProgressBar/ProgressBar'
import BPDQuestionCard from '../BPDQuestionCard/BPDQuestionCard'
import Navigation from '../Navigation/Navigation'

const BPDTestScreen: React.FC = () => {
  const { state, questions, dispatch, severity } = useBPDTest()
  const { authState } = useAuth()
  const navigate = useNavigate()
  const { saveBPDTestResult, error: saveError } = useSaveBPDTestResult()

  const currentQuestion = questions[state.currentQuestion]
  const selectedAnswer = state.answers[state.currentQuestion]

  useEffect(() => {
    console.log('BPDTestScreen: Компонент загружен')
    console.log('BPDTestScreen: Состояние авторизации:', authState.user ? 'авторизован' : 'не авторизован')
  }, [authState.user])

  const handleAnswerSelect = (answer: number) => {
    dispatch({ 
      type: 'ANSWER_QUESTION', 
      questionId: state.currentQuestion, 
      answer 
    })
  }

  const handleNext = async () => {
    if (state.currentQuestion === questions.length - 1) {
      dispatch({ type: 'COMPLETE_TEST' })
      
      // Если пользователь авторизован, сохраняем результаты и переходим в профиль
      if (authState.user?.id) {
        try {
          console.log('BPDTestScreen: Сохраняем результаты теста БПД для авторизованного пользователя')
          
          const completedTestState = {
            ...state,
            isCompleted: true
          }

          await saveBPDTestResult({
            userId: authState.user.id,
            testState: completedTestState,
            totalQuestions: questions.length
          })
          console.log('BPDTestScreen: Результаты БПД теста сохранены, переходим в профиль')
          navigate('/profile')
        } catch (error) {
          console.error('BPDTestScreen: Ошибка при сохранении результатов БПД теста:', error)
          // Продолжаем переход даже при ошибке сохранения
          navigate('/profile')
        }
      } else {
        // Если пользователь не авторизован, переходим на авторизацию
        console.log('BPDTestScreen: Пользователь не авторизован, переходим на авторизацию')
        navigate('/auth')
      }
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  }

  const handlePrevious = () => {
    dispatch({ type: 'PREV_QUESTION' })
  }


  if (state.isCompleted) {
    return (
      <div className="test-screen">
        <div className="test-container">
          <div className="test-completion">
            <h2>Тест завершен!</h2>
            <p>Спасибо за прохождение теста. Ваши ответы сохранены.</p>
            
            {authState.user ? (
              <div className="completion-actions">
                <p>Результаты сохранены в вашем профиле.</p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="btn btn-primary"
                >
                  Перейти в профиль
                </button>
              </div>
            ) : (
              <div className="completion-actions">
                <p>Для просмотра результатов и скачивания PDF отчета необходимо авторизоваться.</p>
                <button 
                  onClick={() => navigate('/auth')}
                  className="btn btn-primary"
                >
                  Авторизоваться
                </button>
              </div>
            )}
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
