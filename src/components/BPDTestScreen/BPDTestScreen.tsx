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
  const { saveBPDTestResult, isSaving, error: saveError } = useSaveBPDTestResult()

  const currentQuestion = questions[state.currentQuestion]
  const selectedAnswer = state.answers[state.currentQuestion]

  useEffect(() => {
    console.log('BPDTestScreen: Компонент загружен')
    
    // Проверяем авторизацию пользователя
    if (!authState.user) {
      console.log('BPDTestScreen: Пользователь не авторизован, перенаправляем на авторизацию')
      navigate('/auth')
      return
    }
    
    console.log('BPDTestScreen: Пользователь авторизован:', authState.user)
  }, [authState.user, navigate])

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
      
      // Сохраняем результаты теста БПД перед переходом
      if (authState.user?.id) {
        try {
          console.log('BPDTestScreen: Сохраняем результаты теста БПД перед переходом')
          
          const completedTestState = {
            ...state,
            isCompleted: true
          }

          await saveBPDTestResult({
            userId: authState.user.id,
            testState: completedTestState,
            totalQuestions: questions.length
          })
          console.log('BPDTestScreen: Результаты БПД теста сохранены, переходим к авторизации')
        } catch (error) {
          console.error('BPDTestScreen: Ошибка при сохранении результатов БПД теста:', error)
          // Продолжаем переход даже при ошибке сохранения
        }
      }

      navigate('/auth')
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  }

  const handlePrevious = () => {
    dispatch({ type: 'PREV_QUESTION' })
  }

  const progress = ((state.currentQuestion + 1) / questions.length) * 100

  if (!authState.user) {
    return (
      <div className="test-screen">
        <div className="test-container">
          <div className="loading-message">
            <h2>Проверка авторизации...</h2>
            <p>Перенаправляем на страницу входа</p>
          </div>
        </div>
      </div>
    )
  }

  if (state.isCompleted) {
    return (
      <div className="test-screen">
        <div className="test-container">
          <div className="test-completed">
            <h2>Тест завершен!</h2>
            <p>Результаты сохранены. Перенаправляем в личный кабинет...</p>
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

        <ProgressBar progress={progress} />

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
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={state.currentQuestion > 0}
            canGoNext={selectedAnswer !== -1}
            isLastQuestion={state.currentQuestion === questions.length - 1}
            isLoading={isSaving}
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
