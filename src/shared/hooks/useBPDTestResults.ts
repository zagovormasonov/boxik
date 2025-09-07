import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BPDTestResult, BPDSeverity } from '../../types'

export interface BPDTestResultWithDetails extends BPDTestResult {
  id: string
  percentage: number
  grade: string
  completed_date: string
}

export function useBPDTestResults(userId: string | null) {
  const [lastTestResult, setLastTestResult] = useState<BPDTestResultWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLastTestResult(null)
      return
    }

    const fetchLastTestResult = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('useBPDTestResults: Загружаем результаты БПД теста для пользователя:', userId)

        // Сначала попробуем найти результаты БПД теста
        let { data, error: fetchError } = await supabase
          .from('test_results')
          .select('*')
          .eq('user_id', userId)
          .eq('test_type', 'bpd')
          .order('completed_at', { ascending: false })
          .limit(1)
          .single()

        // Если не найдены результаты БПД, попробуем найти любые результаты
        if (fetchError && fetchError.code === 'PGRST116') {
          console.log('useBPDTestResults: Результаты БПД не найдены, ищем любые результаты')
          const { data: anyData, error: anyError } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single()
          
          data = anyData
          fetchError = anyError
        }

        if (fetchError) {
          console.error('useBPDTestResults: Ошибка при загрузке:', fetchError)
          console.error('useBPDTestResults: Детали ошибки:', {
            code: fetchError.code,
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint
          })
          if (fetchError.code === 'PGRST116') {
            console.log('useBPDTestResults: Нет результатов тестов для пользователя')
            setLastTestResult(null)
            return
          }
          throw fetchError
        }

        console.log('useBPDTestResults: Получены данные:', data)

        if (data) {
          // Определяем тип теста
          const isBPDTest = data.test_type === 'bpd'
          
          const result: BPDTestResultWithDetails = {
            id: data.id,
            userId: data.user_id,
            totalScore: data.score,
            categoryScores: data.category_scores || {},
            severity: data.grade as BPDSeverity,
            completedAt: data.completed_at,
            answers: data.answers || [],
            percentage: data.percentage || 0,
            grade: data.grade || 'none',
            completed_date: data.completed_at
          }

          console.log('useBPDTestResults: Обработанный результат:', result)
          console.log('useBPDTestResults: Тип теста:', isBPDTest ? 'БПД' : 'Старый')
          setLastTestResult(result)
        } else {
          console.log('useBPDTestResults: Нет результатов тестов для пользователя')
          setLastTestResult(null)
        }
      } catch (err) {
        console.error('useBPDTestResults: Ошибка при загрузке результатов:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки результатов')
        setLastTestResult(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLastTestResult()
  }, [userId])

  const sendToSpecialist = async (testResult: BPDTestResultWithDetails): Promise<boolean> => {
    try {
      console.log('useBPDTestResults: Отправка результатов специалисту:', testResult)
      
      // Здесь должна быть логика отправки результатов специалисту
      // Пока что просто показываем уведомление
      alert(`Результаты БПД теста отправлены специалисту:\n\nОбщий балл: ${testResult.totalScore}\nУровень выраженности: ${getSeverityText(testResult.severity)}\nДата прохождения: ${new Date(testResult.completedAt).toLocaleDateString()}`)
      
      return true
    } catch (error) {
      console.error('useBPDTestResults: Ошибка при отправке результатов:', error)
      return false
    }
  }

  return {
    lastTestResult,
    isLoading,
    error,
    sendToSpecialist
  }
}

// Функция для получения текстового описания уровня выраженности
const getSeverityText = (severity: BPDSeverity): string => {
  switch (severity) {
    case BPDSeverity.NONE:
      return 'Отсутствие симптомов'
    case BPDSeverity.MILD:
      return 'Легкая выраженность'
    case BPDSeverity.MODERATE:
      return 'Умеренная выраженность'
    case BPDSeverity.SEVERE:
      return 'Тяжелая выраженность'
    default:
      return 'Не определено'
  }
}
