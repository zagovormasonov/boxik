import React, { useEffect } from 'react'
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


  const handleAnswerSelect = (answer: number) => {
    dispatch({ 
      type: 'SET_ANSWER', 
      questionId: state.currentQuestion, 
      answer 
    })
  }

  const handleNext = async () => {
    if (state.currentQuestion === questions.length - 1) {
      dispatch({ type: 'COMPLETE_TEST' })
      
      // Сохраняем результаты теста перед переходом
      if (authState.user?.id) {
        try {
          console.log('TestScreen: Сохраняем результаты теста перед переходом')
          
          // Подсчитываем очки
          const score = questions.reduce((acc, question, index) => {
            return acc + (state.answers[index] === question.correctAnswer ? 1 : 0)
          }, 0)
          
          const completedTestState = {
            ...state,
            isCompleted: true,
            score: score
          }
          
          await saveTestResult({
            userId: authState.user.id,
            testState: completedTestState,
            totalQuestions: questions.length
          })
          console.log('TestScreen: Результаты сохранены, переходим к авторизации')
        } catch (error) {
          console.error('TestScreen: Ошибка при сохранении результатов:', error)
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
    <div className="screen-container py">
      <div className="px">
        <h1 className="title text-center mb-md">
          Психологический тест
        </h1>
        <ProgressBar 
          current={state.currentQuestion + 1} 
          total={questions.length} 
        />
      </div>

      <div className="flex-1 px">
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
