import { createClient } from '@supabase/supabase-js'

// Получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Проверяем, что переменные окружения заданы
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

// Проверяем, что URL валидный
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для таблиц Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          user_id: string
          score: number
          total_questions: number
          answers: number[]
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          total_questions: number
          answers: number[]
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          total_questions?: number
          answers?: number[]
          completed_at?: string
        }
      }
    }
  }
}

