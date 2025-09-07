import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTest } from '../../contexts/TestContext'
import { useAuth } from '../../contexts/AuthContext'
import { useSaveTestResult } from '../../shared/hooks/useSaveTestResult'
import ProgressBar from '../ProgressBar/ProgressBar'
import QuestionCard from '../QuestionCard/QuestionCard'
import Navigation from '../Navigation/Navigation'

const TestScreen: React.FC = () => {
  const { state, questions, dispatch } = useTest()
  const { authState } = useAuth()
  const navigate = useNavigate()
  const { saveTestResult, isSaving, error: saveError } = useSaveTestResult()
  const [isTestCompleted, setIsTestCompleted] = useState(false)

  const currentQuestion = questions[state.currentQuestion]
  const selectedAnswer = state.answers[state.currentQuestion]

  useEffect(() => {
    console.log('TestScreen: Компонент загружен')
    
    // Проверяем авторизацию пользователя
    if (!authState.user) {
      console.log('TestScreen: Пользователь не авторизован, перенаправляем на авторизацию')
      navigate('/auth')
      return
    }
    
    console.log('TestScreen: Пользователь авторизован:', authState.user)
  }, [authState.user, navigate])

  // Сохраняем результаты теста при завершении
  useEffect(() => {
    if (state.isCompleted && !isTestCompleted && authState.user?.id) {
      const handleTestCompletion = async () => {
        try {
          setIsTestCompleted(true)
          await saveTestResult({
            userId: authState.user.id,
            testState: state,
            totalQuestions: questions.length
          })
          console.log('Результат теста успешно сохранен')
        } catch (error) {
          console.error('Ошибка при сохранении результата теста:', error)
          // Показываем ошибку, но не блокируем переход
        }
      }
      
      handleTestCompletion()
    }
  }, [state.isCompleted, isTestCompleted, authState.user?.id, state, questions.length, saveTestResult])

  const handleAnswerSelect = (answer: number) => {
    dispatch({ 
      type: 'SET_ANSWER', 
      questionId: state.currentQuestion, 
      answer 
    })
  }

  const handleNext = () => {
    if (state.currentQuestion === questions.length - 1) {
      dispatch({ type: 'COMPLETE_TEST' })
      navigate('/auth')
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  }

  const handlePrevious = () => {
    dispatch({ type: 'PREV_QUESTION' })
  }

  const canGoNext = selectedAnswer !== undefined

  if (state.isCompleted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '16px', color: '#4f46e5' }}>
            Тест завершен!
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            Ваш результат: {state.score} из {questions.length}
          </p>
          
          {isSaving && (
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Сохранение результатов...
            </p>
          )}
          
          {saveError && (
            <p style={{ color: '#ef4444', marginBottom: '20px' }}>
              Ошибка сохранения: {saveError}
            </p>
          )}
          
          <button 
            onClick={() => navigate('/auth')}
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Перейти к авторизации'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      padding: '20px 0'
    }}>
      <div style={{ padding: '0 20px' }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: '#1f2937',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Психологический тест
        </h1>
        <ProgressBar 
          current={state.currentQuestion + 1} 
          total={questions.length} 
        />
      </div>

      <div style={{ flex: 1, padding: '0 20px' }}>
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={handleAnswerSelect}
          />
        )}
      </div>

      <Navigation
        currentQuestion={state.currentQuestion}
        totalQuestions={questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoNext={canGoNext}
      />
    </div>
  )
}

export default TestScreen
