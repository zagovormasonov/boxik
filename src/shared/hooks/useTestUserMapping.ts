import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface TestUserMapping {
  id: string
  session_id: string
  user_id: string
  test_result_id: string
  created_at: string
  updated_at: string
}

export interface CreateTestUserMappingData {
  session_id: string
  user_id: string
  test_result_id: string
}

export function useTestUserMapping() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Создание связи между сессией и пользователем
  const createMapping = async (data: CreateTestUserMappingData): Promise<TestUserMapping | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔗 useTestUserMapping: Создаем связь между сессией и пользователем:', data)

      const { data: mapping, error } = await supabase
        .from('test_user_mapping')
        .insert([{
          session_id: data.session_id,
          user_id: data.user_id,
          test_result_id: data.test_result_id
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ useTestUserMapping: Ошибка при создании связи:', error)
        throw error
      }

      console.log('✅ useTestUserMapping: Связь успешно создана:', mapping)
      return mapping
    } catch (err) {
      console.error('❌ useTestUserMapping: Ошибка при создании связи:', err)
      setError(err instanceof Error ? err.message : 'Не удалось создать связь')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Получение результатов теста для пользователя
  const getTestResultsForUser = async (userId: string): Promise<string[]> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 useTestUserMapping: Получаем результаты теста для пользователя:', userId)

      // Проверяем, является ли userId валидным UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
      console.log('🔍 useTestUserMapping: userId является валидным UUID:', isUUID, 'userId:', userId)

      if (!isUUID) {
        console.log('⚠️ useTestUserMapping: userId не является валидным UUID, возвращаем пустой массив')
        return []
      }

      const { data: mappings, error } = await supabase
        .from('test_user_mapping')
        .select('test_result_id')
        .eq('user_id', userId)

      console.log('🔍 useTestUserMapping: Результат запроса:', { mappings, error })

      if (error) {
        console.error('❌ useTestUserMapping: Ошибка при получении связей:', error)
        console.error('❌ useTestUserMapping: Детали ошибки:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      const testResultIds = mappings?.map(m => m.test_result_id) || []
      console.log('✅ useTestUserMapping: Найдены результаты теста:', testResultIds)
      return testResultIds
    } catch (err) {
      console.error('❌ useTestUserMapping: Ошибка при получении связей:', err)
      setError(err instanceof Error ? err.message : 'Не удалось получить связи')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Связывание существующих результатов теста с пользователем
  const linkExistingTestResults = async (userId: string, sessionId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔗 useTestUserMapping: Связываем существующие результаты с пользователем:', { userId, sessionId })
      console.log('🔍 useTestUserMapping: Весь localStorage:', {
        anonymous_user_id: localStorage.getItem('anonymous_user_id'),
        session_id: localStorage.getItem('session_id')
      })
      console.log('🔍 useTestUserMapping: Весь sessionStorage:', {
        anonymous_user_id: sessionStorage.getItem('anonymous_user_id'),
        session_id: sessionStorage.getItem('session_id')
      })

      // Проверяем localStorage на наличие ожидающих результатов
      const pendingTestResult = localStorage.getItem('pending_test_result')
      if (pendingTestResult) {
        console.log('🔍 useTestUserMapping: Найден ожидающий результат в localStorage')
        try {
          const testResult = JSON.parse(pendingTestResult)
          console.log('🔍 useTestUserMapping: Данные ожидающего результата:', testResult)
          
          // Сохраняем результат в БД с правильным user_id
          const { data, error: insertError } = await supabase
            .from('test_results')
            .insert([{
              user_id: userId, // Используем реальный user_id авторизованного пользователя
              test_type: testResult.test_type,
              total_questions: testResult.total_questions,
              score: testResult.score,
              percentage: testResult.percentage,
              grade: testResult.grade,
              answers: testResult.answers,
              category_scores: testResult.category_scores,
              completed_at: testResult.completed_at
            }])
            .select()
          
          if (insertError) {
            console.error('❌ useTestUserMapping: Ошибка при сохранении ожидающего результата:', insertError)
            return false
          }
          
          console.log('✅ useTestUserMapping: Ожидающий результат успешно сохранен в БД:', data)
          
          // Удаляем ожидающий результат из localStorage
          localStorage.removeItem('pending_test_result')
          console.log('✅ useTestUserMapping: Ожидающий результат удален из localStorage')
          
          return true
        } catch (parseError) {
          console.error('❌ useTestUserMapping: Ошибка при парсинге ожидающего результата:', parseError)
          localStorage.removeItem('pending_test_result')
        }
      }

      // Проверяем localStorage и sessionStorage для поиска anonymousUserId
      const anonymousUserId = localStorage.getItem('anonymous_user_id') || sessionStorage.getItem('anonymous_user_id')
      console.log('🔍 useTestUserMapping: Ищем anonymousUserId в localStorage и sessionStorage:', anonymousUserId)

      // Если есть anonymousUserId, ищем результаты по нему
      if (anonymousUserId) {
        console.log('🔍 useTestUserMapping: Ищем результаты по anonymousUserId:', anonymousUserId)
        const { data: testResults, error: testError } = await supabase
          .from('test_results')
          .select('id, user_id, test_type, completed_at')
          .eq('user_id', anonymousUserId)

        if (testError) {
          console.error('❌ useTestUserMapping: Ошибка при поиске результатов по anonymousUserId:', testError)
          return false
        }

        if (testResults && testResults.length > 0) {
          console.log('🔍 useTestUserMapping: Найдены результаты по anonymousUserId:', testResults.length)
          
          // Обновляем user_id в таблице test_results для каждого результата теста
          for (const testResult of testResults) {
            console.log('🔄 useTestUserMapping: Обновляем user_id для результата теста:', testResult.id)
            
            const { error: updateError } = await supabase
              .from('test_results')
              .update({ user_id: userId })
              .eq('id', testResult.id)

            if (updateError) {
              console.error('❌ useTestUserMapping: Ошибка при обновлении user_id:', updateError)
              continue
            }

            console.log('✅ useTestUserMapping: user_id обновлен для результата:', testResult.id)
          }

          console.log('✅ useTestUserMapping: Все результаты теста связаны с пользователем и обновлены')
          return true
        }
      }

      // Проверяем, является ли sessionId валидным UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)
      console.log('🔍 useTestUserMapping: sessionId является валидным UUID:', isUUID, 'sessionId:', sessionId)

      if (!isUUID) {
        console.log('⚠️ useTestUserMapping: sessionId не является валидным UUID, пропускаем поиск')
        return false
      }

      // Находим результаты теста по session_id
      console.log('🔍 useTestUserMapping: Ищем результаты теста с user_id =', sessionId)
      const { data: testResults, error: testError } = await supabase
        .from('test_results')
        .select('id, user_id, test_type, completed_at')
        .eq('user_id', sessionId) // session_id используется как user_id для неавторизованных пользователей

      if (testError) {
        console.error('❌ useTestUserMapping: Ошибка при поиске результатов теста:', testError)
        console.error('❌ useTestUserMapping: Детали ошибки:', {
          code: testError.code,
          message: testError.message,
          details: testError.details,
          hint: testError.hint
        })
        
        // Для ошибок RLS (406, PGRST301) не выбрасываем исключение, а возвращаем false
        if (testError.code === 'PGRST301' || testError.message?.includes('406')) {
          console.warn('⚠️ useTestUserMapping: Проблемы с RLS, но продолжаем работу')
          return false
        }
        
        throw testError
      }

      console.log('🔍 useTestUserMapping: Найдено результатов теста:', testResults?.length || 0)
      if (testResults && testResults.length > 0) {
        console.log('🔍 useTestUserMapping: Детали найденных результатов:', testResults)
      }

      if (!testResults || testResults.length === 0) {
        console.log('ℹ️ useTestUserMapping: Результаты теста не найдены для сессии:', sessionId)
        return false
      }

      // Обновляем user_id в таблице test_results для каждого результата теста
      for (const testResult of testResults) {
        console.log('🔄 useTestUserMapping: Обновляем user_id для результата теста:', testResult.id)
        
        const { error: updateError } = await supabase
          .from('test_results')
          .update({ user_id: userId })
          .eq('id', testResult.id)

        if (updateError) {
          console.error('❌ useTestUserMapping: Ошибка при обновлении user_id:', updateError)
          console.error('❌ useTestUserMapping: Детали ошибки обновления:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint
          })
          
          // Для ошибок RLS (406, PGRST301) не выбрасываем исключение, а продолжаем
          if (updateError.code === 'PGRST301' || updateError.message?.includes('406')) {
            console.warn('⚠️ useTestUserMapping: Проблемы с RLS при обновлении, пропускаем этот результат')
            continue
          }
          
          throw updateError
        }

        console.log('✅ useTestUserMapping: user_id обновлен для результата:', testResult.id)
      }

      console.log('✅ useTestUserMapping: Все результаты теста связаны с пользователем и обновлены')
      return true
    } catch (err) {
      console.error('❌ useTestUserMapping: Ошибка при связывании результатов:', err)
      setError(err instanceof Error ? err.message : 'Не удалось связать результаты')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const checkTableExists = async (): Promise<boolean> => {
    try {
      console.log('🔍 Проверяем существование таблицы test_user_mapping...')
      const { error } = await supabase
        .from('test_user_mapping')
        .select('id')
        .limit(1)

      if (error) {
        console.error('❌ Таблица test_user_mapping не существует или недоступна:', error)
        return false
      }

      console.log('✅ Таблица test_user_mapping существует и доступна')
      return true
    } catch (err) {
      console.error('❌ Ошибка при проверке таблицы test_user_mapping:', err)
      return false
    }
  }

  // Диагностическая функция для поиска всех результатов теста
  const findAllTestResults = async (): Promise<any[]> => {
    try {
      console.log('🔍 useTestUserMapping: Ищем все результаты теста в таблице test_results')
      const { data: allResults, error } = await supabase
        .from('test_results')
        .select('id, user_id, test_type, completed_at, score')
        .order('completed_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ useTestUserMapping: Ошибка при поиске всех результатов:', error)
        return []
      }

      console.log('🔍 useTestUserMapping: Найдено результатов теста:', allResults?.length || 0)
      if (allResults && allResults.length > 0) {
        console.log('🔍 useTestUserMapping: Последние результаты теста:', allResults)
      }

      return allResults || []
    } catch (err) {
      console.error('❌ useTestUserMapping: Ошибка при поиске всех результатов:', err)
      return []
    }
  }

  return {
    createMapping,
    getTestResultsForUser,
    linkExistingTestResults,
    checkTableExists,
    findAllTestResults,
    isLoading,
    error
  }
}
