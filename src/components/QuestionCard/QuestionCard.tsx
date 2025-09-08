import React from 'react'
import { Question } from '../../types'

interface QuestionCardProps {
  question: Question
  selectedAnswer?: number
  onAnswerSelect: (answer: number) => void
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  selectedAnswer, 
  onAnswerSelect 
}) => {
  return (
    <div className="card">
      <h2 className="title mb-md">
        {question.text}
      </h2>
      <div className="flex flex-col gap">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            className={`btn btn-secondary text-left ${selectedAnswer === index ? 'selected' : ''}`}
            style={{
              border: selectedAnswer === index ? '2px solid var(--accent-color)' : '2px solid var(--gray-200)',
              background: selectedAnswer === index ? 'var(--accent-light)' : 'var(--white)',
              color: selectedAnswer === index ? 'var(--accent-dark)' : 'var(--gray-800)'
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuestionCard
