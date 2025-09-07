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
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

