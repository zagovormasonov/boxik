import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NavigationProps {
  currentQuestion: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  canGoNext: boolean
}

const Navigation: React.FC<NavigationProps> = ({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  canGoNext
}) => {
  const isFirstQuestion = currentQuestion === 0
  const isLastQuestion = currentQuestion === totalQuestions - 1

  return (
    <div className="flex flex-between flex-center mt-md px">
      <button
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="btn btn-secondary"
        style={{ 
          opacity: isFirstQuestion ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <ChevronLeft size={20} />
        Назад
      </button>

      <span className="text-sm text-gray-500 font-medium">
        {currentQuestion + 1} из {totalQuestions}
      </span>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="btn btn-primary"
        style={{ 
          opacity: !canGoNext ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isLastQuestion ? 'Завершить' : 'Далее'}
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

export default Navigation

