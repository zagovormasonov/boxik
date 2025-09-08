import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface Subscription {
  id: string
  user_id: string
  payment_id: string
  order_id: string
  amount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed'
  payment_url?: string
  created_at: string
  updated_at: string
  expires_at?: string
  metadata?: any
}

export interface CreateSubscriptionData {
  user_id: string
  payment_id: string
  order_id: string
  amount: number
  payment_url?: string
  metadata?: any
}

export function useSubscriptions() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Проверка существования таблицы subscriptions
  const checkTableExists = async (): Promise<boolean> => {
    try {
      console.log('🔍 Проверяем существование таблицы subscriptions...')
      const { error } = await supabase
        .from('subscriptions')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('❌ Таблица subscriptions не существует или недоступна:', error)
        return false
      }
      
      console.log('✅ Таблица subscriptions существует и доступна')
      return true
    } catch (err) {
      console.error('❌ Ошибка при проверке таблицы subscriptions:', err)
      return false
    }
  }

  // Создание новой подписки
  const createSubscription = async (data: CreateSubscriptionData): Promise<Subscription | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Создаем подписку в Supabase:', data)
      
      // Проверяем текущего пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log('🔍 Текущий пользователь:', user?.id, 'Ошибка:', userError)
      
      // Проверяем, что user_id совпадает с текущим пользователем
      if (user?.id !== data.user_id) {
        console.error('❌ user_id не совпадает с текущим пользователем:', { 
          currentUser: user?.id, 
          dataUserId: data.user_id 
        })
        throw new Error('user_id не совпадает с текущим пользователем')
      }
      
      // Сначала проверяем существование таблицы
      const tableExists = await checkTableExists()
      if (!tableExists) {
        throw new Error('Таблица subscriptions не существует. Выполните SQL скрипт create_subscriptions_table.sql в Supabase.')
      }
      
      console.log('🔍 Проверяем подключение к Supabase:', supabase)

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: data.user_id,
          payment_id: data.payment_id,
          order_id: data.order_id,
          amount: data.amount,
          status: 'pending',
          payment_url: data.payment_url,
          metadata: data.metadata || {}
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Ошибка при создании подписки:', error)
        console.error('❌ Детали ошибки:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('✅ Подписка успешно создана:', subscription)
      return subscription
    } catch (err) {
      console.error('❌ Ошибка при создании подписки:', err)
      setError(err instanceof Error ? err.message : 'Не удалось создать подписку')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Обновление статуса подписки
  const updateSubscriptionStatus = async (
    paymentId: string, 
    status: 'confirmed' | 'cancelled' | 'failed',
    metadata?: any
  ): Promise<Subscription | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Обновляем статус подписки:', { paymentId, status })

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .update({
          status,
          metadata: metadata || {},
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)
        .select()
        .single()

      if (error) {
        console.error('Ошибка при обновлении подписки:', error)
        throw error
      }

      console.log('Статус подписки обновлен:', subscription)
      return subscription
    } catch (err) {
      console.error('Ошибка при обновлении подписки:', err)
      setError(err instanceof Error ? err.message : 'Не удалось обновить подписку')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Получение активной подписки пользователя
  const getActiveSubscription = async (userId: string): Promise<Subscription | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ useSubscriptions: Ошибка при получении подписки:', error)
        console.error('❌ useSubscriptions: Детали ошибки:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      if (!subscriptions || subscriptions.length === 0) {
        return null
      }

      return subscriptions[0]
    } catch (err) {
      console.error('❌ useSubscriptions: Ошибка при получении подписки:', err)
      setError(err instanceof Error ? err.message : 'Не удалось получить подписку')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Проверка наличия активной подписки
  const hasActiveSubscription = async (userId: string): Promise<boolean> => {
    try {
      const subscription = await getActiveSubscription(userId)
      return subscription !== null
    } catch (error) {
      console.error('❌ hasActiveSubscription: Ошибка при проверке подписки:', error)
      return false
    }
  }

  return {
    createSubscription,
    updateSubscriptionStatus,
    getActiveSubscription,
    hasActiveSubscription,
    checkTableExists,
    isLoading,
    error
  }
}
