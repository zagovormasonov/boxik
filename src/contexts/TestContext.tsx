import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Question, TestState } from '../types'

interface TestContextType {
  state: TestState
  questions: Question[]
  dispatch: React.Dispatch<TestAction>
}

type TestAction =
  | { type: 'SET_ANSWER'; questionId: number; answer: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'COMPLETE_TEST' }
  | { type: 'RESET_TEST' }

const initialState: TestState = {
  currentQuestion: 0,
  answers: [],
  isCompleted: false,
  score: 0
}

const questions: Question[] = [
  {
    id: 1,
    text: 'Как вы обычно реагируете на стрессовые ситуации?',
    options: ['Активно ищу решение проблемы', 'Избегаю конфронтации', 'Обращаюсь за помощью к другим', 'Анализирую ситуацию спокойно'],
    correctAnswer: 0
  },
  {
    id: 2,
    text: 'Что для вас важнее в отношениях?',
    options: ['Доверие и честность', 'Страсть и эмоции', 'Стабильность и безопасность', 'Свобода и независимость'],
    correctAnswer: 0
  },
  {
    id: 3,
    text: 'Как вы предпочитаете принимать решения?',
    options: ['Интуитивно, полагаясь на чувства', 'Логически, анализируя факты', 'Советуясь с близкими', 'Импульсивно, по первому порыву'],
    correctAnswer: 1
  },
  {
    id: 4,
    text: 'Что вас больше всего мотивирует?',
    options: ['Достижение целей', 'Признание окружающих', 'Личностный рост', 'Материальное благополучие'],
    correctAnswer: 2
  },
  {
    id: 5,
    text: 'Как вы относитесь к изменениям в жизни?',
    options: ['Принимаю с энтузиазмом', 'Адаптируюсь постепенно', 'Предпочитаю стабильность', 'Избегаю любых перемен'],
    correctAnswer: 1
  }
]

function testReducer(state: TestState, action: TestAction): TestState {
  switch (action.type) {
    case 'SET_ANSWER':
      const newAnswers = [...state.answers]
      newAnswers[action.questionId] = action.answer
      return { ...state, answers: newAnswers }
    
    case 'NEXT_QUESTION':
      return { ...state, currentQuestion: state.currentQuestion + 1 }
    
    case 'PREV_QUESTION':
      return { ...state, currentQuestion: Math.max(0, state.currentQuestion - 1) }
    
    case 'COMPLETE_TEST':
      const score = questions.reduce((acc, question, index) => {
        return acc + (state.answers[index] === question.correctAnswer ? 1 : 0)
      }, 0)
      return { ...state, isCompleted: true, score }
    
    case 'RESET_TEST':
      return initialState
    
    default:
      return state
  }
}

const TestContext = createContext<TestContextType | undefined>(undefined)

export function TestProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(testReducer, initialState)

  return (
    <TestContext.Provider value={{ state, questions, dispatch }}>
      {children}
    </TestContext.Provider>
  )
}

export function useTest() {
  const context = useContext(TestContext)
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider')
  }
  return context
}

