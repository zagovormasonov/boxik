import React from 'react'
import { BPDQuestion } from '../../types'

interface BPDQuestionCardProps {
  question: BPDQuestion
  selectedAnswer: number
  onAnswerSelect: (answer: number) => void
}

const BPDQuestionCard: React.FC<BPDQuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect
}) => {
  const getCategoryText = (category: string): string => {
    switch (category) {
      case 'fear_of_abandonment':
        return 'Страх покинутости'
      case 'unstable_relationships':
        return 'Нестабильные отношения'
      case 'identity_disturbance':
        return 'Нарушение идентичности'
      case 'impulsivity':
        return 'Импульсивность'
      case 'suicidal_behavior':
        return 'Суицидальное поведение'
      case 'affective_instability':
        return 'Аффективная нестабильность'
      case 'emptiness':
        return 'Чувство пустоты'
      case 'anger':
        return 'Приступы гнева'
      case 'paranoid_ideation':
        return 'Параноидные идеи'
      default:
        return 'Неизвестная категория'
    }
  }

  return (
    <div className="question-card">
      <div className="question-category">
        <span className="category-badge">
          {getCategoryText(question.category)}
        </span>
      </div>
      
      <div className="question-content">
        <h3 className="question-text">{question.text}</h3>
        
        <div className="answer-options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`answer-option ${selectedAnswer === index ? 'selected' : ''}`}
              onClick={() => onAnswerSelect(index)}
            >
              <span className="option-number">{index + 1}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BPDQuestionCard
