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

      if (error) {
        console.error('❌ useTestUserMapping: Ошибка при получении связей:', error)
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
        throw testError
      }

      if (!testResults || testResults.length === 0) {
        console.log('ℹ️ useTestUserMapping: Результаты теста не найдены для сессии:', sessionId)
        return false
      }

      // Создаем связи для каждого результата теста
      for (const testResult of testResults) {
        await createMapping({
          session_id: sessionId,
          user_id: userId,
          test_result_id: testResult.id
        })
      }

      console.log('✅ useTestUserMapping: Все результаты теста связаны с пользователем')
      return true
    } catch (err) {
      console.error('❌ useTestUserMapping: Ошибка при связывании результатов:', err)
      setError(err instanceof Error ? err.message : 'Не удалось связать результаты')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createMapping,
    getTestResultsForUser,
    linkExistingTestResults,
    isLoading,
    error
  }
}
