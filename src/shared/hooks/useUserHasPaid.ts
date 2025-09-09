import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface UserHasPaid {
  id: string
  hasPaid: boolean
  updated_at: string
}

export function useUserHasPaid() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Получение статуса оплаты пользователя
  const getUserHasPaid = async (userId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Получаем статус оплаты для пользователя:', userId)
      
      // Убираем проверку сессии - пользователь может быть авторизован через Яндекс
      console.log('🔍 Проверяем статус оплаты без проверки сессии Supabase')
      
      const { data, error } = await supabase
        .from('users')
        .select('hasPaid')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Ошибка при получении статуса оплаты:', error)
        throw error
      }

      const hasPaid = data?.hasPaid || false
      console.log('✅ Статус оплаты пользователя:', hasPaid)
      return hasPaid
    } catch (err) {
      console.error('❌ Ошибка при получении статуса оплаты:', err)
      setError(err instanceof Error ? err.message : 'Не удалось получить статус оплаты')
      // При ошибке возвращаем false (не оплачено)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Обновление статуса оплаты пользователя
  const updateUserHasPaid = async (userId: string, hasPaid: boolean): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Обновляем статус оплаты для пользователя:', userId, 'hasPaid:', hasPaid)
      
      // Убираем проверку сессии - пользователь может быть авторизован через Яндекс
      console.log('🔍 Обновляем статус оплаты без проверки сессии Supabase')
      
      // Проверяем текущего пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('🔍 Текущий пользователь при обновлении:', user?.id, 'Ошибка:', userError)
      
      const { data, error } = await supabase
        .from('users')
        .update({ hasPaid })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('❌ Ошибка при обновлении статуса оплаты:', error)
        console.error('❌ Детали ошибки:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('✅ Статус оплаты успешно обновлен:', data)
      return true
    } catch (err) {
      console.error('❌ Ошибка при обновлении статуса оплаты:', err)
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус оплаты')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Принудительная установка статуса оплаты (для оплаты)
  const setUserPaid = async (userId: string): Promise<boolean> => {
    console.log('🔄 Принудительно устанавливаем hasPaid: true для пользователя:', userId)
    return await updateUserHasPaid(userId, true)
  }

  // Сброс статуса оплаты (для тестирования)
  const resetUserPaid = async (userId: string): Promise<boolean> => {
    console.log('🔄 Сбрасываем hasPaid: false для пользователя:', userId)
    return await updateUserHasPaid(userId, false)
  }

  return {
    isLoading,
    error,
    getUserHasPaid,
    updateUserHasPaid,
    setUserPaid,
    resetUserPaid
  }
}
