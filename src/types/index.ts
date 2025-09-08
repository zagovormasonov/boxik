// Интерфейс для вопроса теста БПД
export interface BPDQuestion {
  id: number
  text: string
  options: string[]
  category: BPDCategory // Категория симптома БПД
  weight: number // Вес вопроса в общей оценке
}

// Категории симптомов БПД по DSM-5
export enum BPDCategory {
  FEAR_OF_ABANDONMENT = 'fear_of_abandonment', // Страх покинутости
  UNSTABLE_RELATIONSHIPS = 'unstable_relationships', // Нестабильные отношения
  IDENTITY_DISTURBANCE = 'identity_disturbance', // Нарушение идентичности
  IMPULSIVITY = 'impulsivity', // Импульсивность
  SUICIDAL_BEHAVIOR = 'suicidal_behavior', // Суицидальное поведение
  AFFECTIVE_INSTABILITY = 'affective_instability', // Аффективная нестабильность
  EMPTINESS = 'emptiness', // Чувство пустоты
  ANGER = 'anger', // Приступы гнева
  PARANOID_IDEATION = 'paranoid_ideation' // Параноидные идеи
}

// Результат теста БПД
export interface BPDTestResult {
  userId: string
  totalScore: number
  categoryScores: Record<BPDCategory, number>
  severity: BPDSeverity
  completedAt: string
  answers: number[]
}

// Уровень выраженности БПД
export enum BPDSeverity {
  NONE = 'none', // Отсутствие симптомов
  MILD = 'mild', // Легкая выраженность
  MODERATE = 'moderate', // Умеренная выраженность
  SEVERE = 'severe' // Тяжелая выраженность
}

// Состояние теста БПД
export interface BPDTestState {
  currentQuestion: number
  answers: number[]
  isCompleted: boolean
  categoryScores: Record<BPDCategory, number>
  totalScore: number
}

// Старые типы (для совместимости)
export interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
}

export interface TestState {
  currentQuestion: number
  answers: number[]
  isCompleted: boolean
  score: number
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  created_at?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

