import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { BPDTestResult, BPDSeverity } from '../../types'
import { useTestUserMapping } from './useTestUserMapping'

export interface BPDTestResultWithDetails extends BPDTestResult {
  id: string
  percentage: number
  grade: string
  completed_date: string
}

export function useBPDTestResults(userId: string | null) {
  console.log('useBPDTestResults: Хук вызван с userId:', userId)
  const [lastTestResult, setLastTestResult] = useState<BPDTestResultWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getTestResultsForUser, checkTableExists } = useTestUserMapping()

  useEffect(() => {
    console.log('useBPDTestResults: useEffect вызван с userId:', userId)
    console.log('useBPDTestResults: Тип userId:', typeof userId)
    console.log('useBPDTestResults: userId === null:', userId === null)
    console.log('useBPDTestResults: userId === undefined:', userId === undefined)
    
    if (!userId) {
      console.log('useBPDTestResults: userId отсутствует, очищаем результат')
      setLastTestResult(null)
      return
    }

    console.log('useBPDTestResults: userId валиден, начинаем загрузку')
    const fetchLastTestResult = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log('useBPDTestResults: Загружаем результаты БПД теста для пользователя:', userId)

        // Проверяем существование таблицы test_user_mapping
        const tableExists = await checkTableExists()
        console.log('useBPDTestResults: Таблица test_user_mapping существует:', tableExists)

        // Получаем ID результатов теста через таблицу связей
        const testResultIds = await getTestResultsForUser(userId)
        console.log('useBPDTestResults: Найдены ID результатов теста:', testResultIds)
        
        let data = null
        let fetchError = null

        // Если нет связей, попробуем прямой поиск по user_id
        if (testResultIds.length === 0) {
          console.log('useBPDTestResults: Нет связей в test_user_mapping, пробуем прямой поиск')
          const { data: directData, error: directError } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single()
          
          console.log('useBPDTestResults: Результат прямого поиска БПД:', { data: directData, error: directError })
          
          if (directData) {
            console.log('useBPDTestResults: Получены данные:', directData)
            data = directData
            fetchError = directError
          }
        }

        if (testResultIds.length > 0) {
          // Ищем результаты БПД теста среди связанных результатов
          const { data: bpdData, error: bpdError } = await supabase
            .from('test_results')
            .select('*')
            .in('id', testResultIds)
            .eq('test_type', 'bpd')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single()

          if (!bpdError) {
            data = bpdData
          } else if (bpdError.code === 'PGRST116') {
            // Если БПД тест не найден, берем последний результат любого типа
            const { data: anyData, error: anyError } = await supabase
              .from('test_results')
              .select('*')
              .in('id', testResultIds)
              .order('completed_at', { ascending: false })
              .limit(1)
              .single()
            
            data = anyData
            fetchError = anyError
          } else {
            fetchError = bpdError
          }
        } else {
          // Если связей нет, ищем результаты напрямую по userId (для обратной совместимости)
          console.log('useBPDTestResults: Связи не найдены, ищем результаты напрямую')
          const { data: directData, error: directError } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .eq('test_type', 'bpd')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single()

          console.log('useBPDTestResults: Результат прямого поиска БПД:', { data: directData, error: directError })
          
          if (!directError) {
            data = directData
          } else if (directError.code === 'PGRST116') {
            // Если БПД тест не найден, ищем любой тест
            console.log('useBPDTestResults: БПД тест не найден, ищем любой тест')
            const { data: anyDirectData, error: anyDirectError } = await supabase
              .from('test_results')
              .select('*')
              .eq('user_id', userId)
              .order('completed_at', { ascending: false })
              .limit(1)
              .single()

            console.log('useBPDTestResults: Результат поиска любого теста:', { data: anyDirectData, error: anyDirectError })
            
            if (!anyDirectError) {
              data = anyDirectData
            } else {
              fetchError = anyDirectError
            }
          } else {
            fetchError = directError
          }
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
          
          // Для ошибок 406 (Not Acceptable) и других ошибок доступа
          if (fetchError.code === 'PGRST301' || fetchError.message?.includes('406')) {
            console.warn('useBPDTestResults: Проблемы с доступом к таблице test_results, используем fallback')
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
