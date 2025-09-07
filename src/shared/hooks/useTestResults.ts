import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export interface TestResult {
  id: string
  user_id: string
  score: number
  total_questions: number
  answers: number[]
  completed_at: string
}

export interface TestResultWithDetails extends TestResult {
  percentage: number
  grade: string
  completed_date: string
}

export function useTestResults(userId: string | null) {
  const [lastTestResult, setLastTestResult] = useState<TestResultWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLastTestResult(null)
      return
    }

    fetchLastTestResult()
  }, [userId])

  const fetchLastTestResult = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Нет результатов тестов
          setLastTestResult(null)
          return
        }
        throw error
      }

      if (data) {
        const percentage = Math.round((data.score / data.total_questions) * 100)
        const grade = getGrade(percentage)
        
        const resultWithDetails: TestResultWithDetails = {
          ...data,
          percentage,
          grade,
          completed_date: new Date(data.completed_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }

        setLastTestResult(resultWithDetails)
      }
    } catch (err) {
      console.error('Ошибка при получении результатов теста:', err)
      setError('Не удалось загрузить результаты теста')
    } finally {
      setIsLoading(false)
    }
  }

  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'Отлично'
    if (percentage >= 80) return 'Хорошо'
    if (percentage >= 70) return 'Удовлетворительно'
    if (percentage >= 60) return 'Зачет'
    return 'Неудовлетворительно'
  }

  const sendToSpecialist = async (testResult: TestResultWithDetails) => {
    try {
      // Здесь будет логика отправки результатов специалисту
      // Пока что просто показываем уведомление
      console.log('Отправка результатов специалисту:', testResult)
      
      // Можно добавить API вызов для отправки email или уведомления
      alert(`Результаты теста отправлены специалисту!\n\nРезультат: ${testResult.score}/${testResult.total_questions} (${testResult.percentage}%)\nДата: ${testResult.completed_date}`)
      
      return true
    } catch (err) {
      console.error('Ошибка при отправке результатов:', err)
      return false
    }
  }

  return {
    lastTestResult,
    isLoading,
    error,
    sendToSpecialist,
    refetch: fetchLastTestResult
  }
}
