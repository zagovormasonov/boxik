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
  console.log('useBPDTestResults: Тип userId:', typeof userId)
  console.log('useBPDTestResults: userId валиден:', !!userId)
  
  const [lastTestResult, setLastTestResult] = useState<BPDTestResultWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const { getTestResultsForUser, checkTableExists } = useTestUserMapping()
  
  console.log('useBPDTestResults: Текущее состояние хука:', { 
    lastTestResult: lastTestResult ? 'есть' : 'нет', 
    isLoading, 
    hasLoaded, 
    error 
  })
  

  useEffect(() => {
    console.log('useBPDTestResults: useEffect вызван с userId:', userId)
    console.log('useBPDTestResults: Тип userId:', typeof userId)
    console.log('useBPDTestResults: userId === null:', userId === null)
    console.log('useBPDTestResults: userId === undefined:', userId === undefined)
    
    if (!userId) {
      console.log('useBPDTestResults: userId отсутствует, очищаем результат')
      setLastTestResult(null)
      setHasLoaded(false)
      return
    }

    console.log('useBPDTestResults: userId валиден, начинаем загрузку')
    console.log('useBPDTestResults: Текущее состояние:', { isLoading, hasLoaded, lastTestResult: lastTestResult ? 'есть' : 'нет' })
    
    // Проверяем, не идет ли уже загрузка
    if (isLoading) {
      console.log('useBPDTestResults: Загрузка уже идет, пропускаем')
      return
    }
    
    // Если результаты не загружены, принудительно запускаем загрузку
    if (!hasLoaded && !lastTestResult) {
      console.log('useBPDTestResults: Результаты не загружены, принудительно запускаем загрузку')
    }
    
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

        // Если нет связей, пробуем прямой поиск по user_id
        if (testResultIds.length === 0) {
          console.log('useBPDTestResults: Нет связей в test_user_mapping, пробуем прямой поиск')
          
          // Пробуем поиск БПД теста
          const { data: bpdData, error: bpdError } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .eq('test_type', 'bpd')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single()
          
          console.log('useBPDTestResults: Результат прямого поиска БПД:', { data: bpdData, error: bpdError })
          
          if (bpdData) {
            console.log('useBPDTestResults: Получены данные БПД:', bpdData)
            data = bpdData
            fetchError = bpdError
          } else if (bpdError && (bpdError.code === 'PGRST116' || bpdError.message?.includes('406'))) {
            console.log('useBPDTestResults: БПД тест не найден, ищем любой тест')
            
            // Если БПД не найден, ищем любой тест
            const { data: anyData, error: anyError } = await supabase
              .from('test_results')
              .select('*')
              .eq('user_id', userId)
              .order('completed_at', { ascending: false })
              .limit(1)
              .single()
            
            console.log('useBPDTestResults: Результат поиска любого теста:', { data: anyData, error: anyError })
            
            if (anyData) {
              console.log('useBPDTestResults: Получены данные любого теста:', anyData)
              data = anyData
              fetchError = anyError
            } else {
              console.log('useBPDTestResults: Ошибка при загрузке:', anyError)
              if (anyError) {
                console.log('useBPDTestResults: Детали ошибки:', {
                  code: anyError.code,
                  message: anyError.message,
                  details: anyError.details,
                  hint: anyError.hint
                })
              }
            }
          } else {
            console.log('useBPDTestResults: Ошибка при поиске БПД:', bpdError)
            fetchError = bpdError
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

          if (bpdData) {
            console.log('useBPDTestResults: Получены данные БПД из связей:', bpdData)
            data = bpdData
            fetchError = bpdError
          } else if (bpdError && (bpdError.code === 'PGRST116' || bpdError.message?.includes('406'))) {
            // Если БПД тест не найден, берем последний результат любого типа
            console.log('useBPDTestResults: БПД тест не найден в связях, ищем любой тест')
            const { data: anyData, error: anyError } = await supabase
              .from('test_results')
              .select('*')
              .in('id', testResultIds)
              .order('completed_at', { ascending: false })
              .limit(1)
              .single()
            
            if (anyData) {
              console.log('useBPDTestResults: Получены данные любого теста из связей:', anyData)
              data = anyData
            }
            fetchError = anyError
          } else {
            console.log('useBPDTestResults: Ошибка при поиске БПД в связях:', bpdError)
            fetchError = bpdError
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
        setHasLoaded(true)
      }
    }

    // Принудительно запускаем загрузку
    console.log('useBPDTestResults: Принудительно запускаем загрузку результатов')
    console.log('useBPDTestResults: Текущее состояние:', { isLoading, hasLoaded, lastTestResult: lastTestResult ? 'есть' : 'нет' })
    fetchLastTestResult()
  }, [userId])

  // Дополнительная проверка: если результаты не загружены, но userId есть, принудительно загружаем
  useEffect(() => {
    if (userId && !isLoading && !hasLoaded && !lastTestResult) {
      console.log('useBPDTestResults: Дополнительная проверка - принудительно загружаем результаты')
      const fetchLastTestResult = async () => {
        setIsLoading(true)
        setError(null)

        try {
          console.log('useBPDTestResults: Дополнительная загрузка для пользователя:', userId)
          
          // Прямой поиск по user_id
          const { data: directData, error: directError } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .eq('test_type', 'bpd')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single()

          console.log('useBPDTestResults: Результат дополнительного поиска БПД:', { data: directData, error: directError })
          
          if (directData) {
            console.log('useBPDTestResults: Найден результат БПД:', directData)
            const result: BPDTestResultWithDetails = {
              id: directData.id,
              userId: directData.user_id,
              totalScore: directData.score,
              categoryScores: directData.category_scores || {},
              severity: directData.grade as BPDSeverity,
              completedAt: directData.completed_at,
              answers: directData.answers || [],
              percentage: directData.percentage || 0,
              grade: directData.grade || 'none',
              completed_date: directData.completed_at
            }
            setLastTestResult(result)
          } else if (directError && (directError.code === 'PGRST116' || directError.message?.includes('406'))) {
            console.log('useBPDTestResults: БПД тест не найден, ищем любой тест')
            const { data: anyData, error: anyError } = await supabase
              .from('test_results')
              .select('*')
              .eq('user_id', userId)
              .order('completed_at', { ascending: false })
              .limit(1)
              .single()

            console.log('useBPDTestResults: Результат поиска любого теста:', { data: anyData, error: anyError })
            
            if (anyData) {
              console.log('useBPDTestResults: Найден любой тест:', anyData)
              const result: BPDTestResultWithDetails = {
                id: anyData.id,
                userId: anyData.user_id,
                totalScore: anyData.score,
                categoryScores: anyData.category_scores || {},
                severity: anyData.grade as BPDSeverity,
                completedAt: anyData.completed_at,
                answers: anyData.answers || [],
                percentage: anyData.percentage || 0,
                grade: anyData.grade || 'none',
                completed_date: anyData.completed_at
              }
              setLastTestResult(result)
            } else {
              console.log('useBPDTestResults: Результаты теста не найдены')
              setLastTestResult(null)
            }
          } else {
            console.log('useBPDTestResults: Ошибка при дополнительном поиске:', directError)
            setError(directError?.message || 'Ошибка загрузки результатов')
          }
        } catch (err) {
          console.error('useBPDTestResults: Ошибка при дополнительной загрузке:', err)
          setError(err instanceof Error ? err.message : 'Ошибка загрузки результатов')
        } finally {
          setIsLoading(false)
          setHasLoaded(true)
        }
      }
      
      fetchLastTestResult()
    }
  }, [userId, isLoading, hasLoaded, lastTestResult])

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
