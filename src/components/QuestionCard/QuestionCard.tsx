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
      <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
        {question.text}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            style={{
              padding: '12px 16px',
              border: selectedAnswer === index ? '2px solid #4f46e5' : '2px solid #e5e7eb',
              borderRadius: '8px',
              background: selectedAnswer === index ? '#f0f0ff' : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '16px',
              color: '#1f2937',
              transition: 'all 0.2s ease'
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
