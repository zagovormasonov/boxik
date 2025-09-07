import React from 'react'
import { CheckCircle, XCircle, Circle } from 'lucide-react'
import { TestResultWithDetails } from '../../shared/hooks/useTestResults'
import { Question } from '../../types'

interface TestResultDetailsProps {
  testResult: TestResultWithDetails
  questions: Question[]
  userAnswers: number[]
}

const TestResultDetails: React.FC<TestResultDetailsProps> = ({ 
  testResult, 
  questions, 
  userAnswers 
}) => {
  const getAnswerIcon = (questionIndex: number, optionIndex: number) => {
    const isUserAnswer = userAnswers[questionIndex] === optionIndex
    const isCorrectAnswer = questions[questionIndex].correctAnswer === optionIndex
    
    if (isUserAnswer && isCorrectAnswer) {
      return <CheckCircle size={16} className="text-green-500" />
    } else if (isUserAnswer && !isCorrectAnswer) {
      return <XCircle size={16} className="text-red-500" />
    } else if (!isUserAnswer && isCorrectAnswer) {
      return <Circle size={16} className="text-blue-500" />
    }
    return <Circle size={16} className="text-gray-300" />
  }

  const getAnswerText = (questionIndex: number, optionIndex: number) => {
    const isUserAnswer = userAnswers[questionIndex] === optionIndex
    const isCorrectAnswer = questions[questionIndex].correctAnswer === optionIndex
    
    if (isUserAnswer && isCorrectAnswer) {
      return 'Ваш правильный ответ'
    } else if (isUserAnswer && !isCorrectAnswer) {
      return 'Ваш неправильный ответ'
    } else if (!isUserAnswer && isCorrectAnswer) {
      return 'Правильный ответ'
    }
    return ''
  }

  return (
    <div className="test-result-details">
      <div className="details-header">
        <h3 className="details-title">Детальные результаты теста</h3>
        <div className="details-summary">
          <div className="summary-item">
            <span className="summary-label">Общий результат:</span>
            <span className="summary-value">{testResult.score}/{testResult.total_questions}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Процент:</span>
            <span className="summary-value">{testResult.percentage}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Оценка:</span>
            <span className="summary-value">{testResult.grade}</span>
          </div>
        </div>
      </div>

      <div className="questions-list">
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <h4 className="question-title">
                {questionIndex + 1}. {question.text}
              </h4>
            </div>
            
            <div className="question-options">
              {question.options.map((option, optionIndex) => (
                <div 
                  key={optionIndex} 
                  className={`option-item ${
                    userAnswers[questionIndex] === optionIndex ? 'user-selected' : ''
                  } ${
                    questions[questionIndex].correctAnswer === optionIndex ? 'correct-answer' : ''
                  }`}
                >
                  <div className="option-icon">
                    {getAnswerIcon(questionIndex, optionIndex)}
                  </div>
                  <div className="option-content">
                    <span className="option-text">{option}</span>
                    <span className="option-status">
                      {getAnswerText(questionIndex, optionIndex)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestResultDetails
