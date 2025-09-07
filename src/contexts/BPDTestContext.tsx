import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { BPDTestState, BPDQuestion, BPDCategory, BPDSeverity } from '../types'

// Вопросы теста БПД на основе DSM-5 критериев
export const bpdQuestions: BPDQuestion[] = [
  // 1. Страх покинутости
  {
    id: 1,
    text: "Я испытываю сильный страх быть покинутым(ой) близкими людьми",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.FEAR_OF_ABANDONMENT,
    weight: 1.0
  },
  {
    id: 2,
    text: "Я делаю все возможное, чтобы избежать реального или воображаемого отказа",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.FEAR_OF_ABANDONMENT,
    weight: 1.0
  },

  // 2. Нестабильные отношения
  {
    id: 3,
    text: "Мои отношения с людьми характеризуются крайностями - идеализацией и обесцениванием",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.UNSTABLE_RELATIONSHIPS,
    weight: 1.0
  },
  {
    id: 4,
    text: "Я быстро меняю свое мнение о людях - от восхищения до полного разочарования",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.UNSTABLE_RELATIONSHIPS,
    weight: 1.0
  },

  // 3. Нарушение идентичности
  {
    id: 5,
    text: "У меня нестабильное представление о себе, своих целях и ценностях",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.IDENTITY_DISTURBANCE,
    weight: 1.0
  },
  {
    id: 6,
    text: "Я часто чувствую, что не знаю, кто я на самом деле",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.IDENTITY_DISTURBANCE,
    weight: 1.0
  },

  // 4. Импульсивность
  {
    id: 7,
    text: "Я совершаю импульсивные поступки, которые могут причинить вред мне или другим",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.IMPULSIVITY,
    weight: 1.0
  },
  {
    id: 8,
    text: "Я трачу деньги, употребляю вещества или веду себя рискованно импульсивно",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.IMPULSIVITY,
    weight: 1.0
  },

  // 5. Суицидальное поведение
  {
    id: 9,
    text: "У меня были мысли о самоповреждении или суициде",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.SUICIDAL_BEHAVIOR,
    weight: 1.0
  },
  {
    id: 10,
    text: "Я угрожал(а) самоубийством или причинял(а) себе вред",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.SUICIDAL_BEHAVIOR,
    weight: 1.0
  },

  // 6. Аффективная нестабильность
  {
    id: 11,
    text: "Мое настроение резко меняется в течение дня",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.AFFECTIVE_INSTABILITY,
    weight: 1.0
  },
  {
    id: 12,
    text: "Я испытываю сильные эмоциональные реакции на незначительные события",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.AFFECTIVE_INSTABILITY,
    weight: 1.0
  },

  // 7. Чувство пустоты
  {
    id: 13,
    text: "Я часто чувствую внутреннюю пустоту",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.EMPTINESS,
    weight: 1.0
  },
  {
    id: 14,
    text: "Мне трудно найти смысл в жизни",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.EMPTINESS,
    weight: 1.0
  },

  // 8. Приступы гнева
  {
    id: 15,
    text: "У меня бывают неконтролируемые приступы гнева",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.ANGER,
    weight: 1.0
  },
  {
    id: 16,
    text: "Мне трудно контролировать свой гнев",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.ANGER,
    weight: 1.0
  },

  // 9. Параноидные идеи
  {
    id: 17,
    text: "В стрессовых ситуациях у меня появляются подозрения в отношении других людей",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.PARANOID_IDEATION,
    weight: 1.0
  },
  {
    id: 18,
    text: "Я чувствую, что люди хотят причинить мне вред",
    options: ["Никогда", "Редко", "Иногда", "Часто", "Всегда"],
    category: BPDCategory.PARANOID_IDEATION,
    weight: 1.0
  }
]

// Действия для управления состоянием теста БПД
type BPDTestAction =
  | { type: 'ANSWER_QUESTION'; questionId: number; answer: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'COMPLETE_TEST' }
  | { type: 'RESET_TEST' }

// Начальное состояние теста БПД
const initialState: BPDTestState = {
  currentQuestion: 0,
  answers: new Array(bpdQuestions.length).fill(-1),
  isCompleted: false,
  categoryScores: Object.values(BPDCategory).reduce((acc, category) => {
    acc[category] = 0
    return acc
  }, {} as Record<BPDCategory, number>),
  totalScore: 0
}

// Функция для расчета баллов по категориям
const calculateCategoryScores = (answers: number[], questions: BPDQuestion[]): Record<BPDCategory, number> => {
  const categoryScores = Object.values(BPDCategory).reduce((acc, category) => {
    acc[category] = 0
    return acc
  }, {} as Record<BPDCategory, number>)

  questions.forEach((question, index) => {
    const answer = answers[index]
    if (answer >= 0) {
      // Баллы: 0-4 (Никогда=0, Редко=1, Иногда=2, Часто=3, Всегда=4)
      const score = answer * question.weight
      categoryScores[question.category] += score
    }
  })

  return categoryScores
}

// Функция для определения уровня выраженности БПД
const calculateSeverity = (totalScore: number, categoryScores: Record<BPDCategory, number>): BPDSeverity => {
  // Пороговые значения на основе клинических стандартов
  if (totalScore < 20) return BPDSeverity.NONE
  if (totalScore < 40) return BPDSeverity.MILD
  if (totalScore < 60) return BPDSeverity.MODERATE
  return BPDSeverity.SEVERE
}

// Редьюсер для управления состоянием теста БПД
const bpdTestReducer = (state: BPDTestState, action: BPDTestAction): BPDTestState => {
  switch (action.type) {
    case 'ANSWER_QUESTION':
      const newAnswers = [...state.answers]
      newAnswers[action.questionId] = action.answer
      
      const categoryScores = calculateCategoryScores(newAnswers, bpdQuestions)
      const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0)
      
      return {
        ...state,
        answers: newAnswers,
        categoryScores,
        totalScore
      }

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: Math.min(state.currentQuestion + 1, bpdQuestions.length - 1)
      }

    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestion: Math.max(state.currentQuestion - 1, 0)
      }

    case 'COMPLETE_TEST':
      return {
        ...state,
        isCompleted: true
      }

    case 'RESET_TEST':
      return initialState

    default:
      return state
  }
}

// Контекст для теста БПД
interface BPDTestContextType {
  state: BPDTestState
  dispatch: React.Dispatch<BPDTestAction>
  questions: BPDQuestion[]
  severity: BPDSeverity
}

const BPDTestContext = createContext<BPDTestContextType | undefined>(undefined)

// Провайдер контекста теста БПД
export const BPDTestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bpdTestReducer, initialState)
  
  const severity = calculateSeverity(state.totalScore, state.categoryScores)

  return (
    <BPDTestContext.Provider value={{
      state,
      dispatch,
      questions: bpdQuestions,
      severity
    }}>
      {children}
    </BPDTestContext.Provider>
  )
}

// Хук для использования контекста теста БПД
export const useBPDTest = (): BPDTestContextType => {
  const context = useContext(BPDTestContext)
  if (!context) {
    throw new Error('useBPDTest must be used within a BPDTestProvider')
  }
  return context
}
