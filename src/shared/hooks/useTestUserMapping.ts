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

      // Находим результаты теста по session_id
      const { data: testResults, error: testError } = await supabase
        .from('test_results')
        .select('id')
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

  return {
    createMapping,
    getTestResultsForUser,
    linkExistingTestResults,
    checkTableExists,
    isLoading,
    error
  }
}
