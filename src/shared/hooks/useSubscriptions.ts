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

  // Создание новой подписки
  const createSubscription = async (data: CreateSubscriptionData): Promise<Subscription | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Создаем подписку в Supabase:', data)

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
        console.error('Ошибка при создании подписки:', error)
        throw error
      }

      console.log('Подписка успешно создана:', subscription)
      return subscription
    } catch (err) {
      console.error('Ошибка при создании подписки:', err)
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
      console.log('Получаем активную подписку для пользователя:', userId)

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Ошибка при получении подписки:', error)
        throw error
      }

      console.log('Активная подписка:', subscription)
      return subscription
    } catch (err) {
      console.error('Ошибка при получении подписки:', err)
      setError(err instanceof Error ? err.message : 'Не удалось получить подписку')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Проверка наличия активной подписки
  const hasActiveSubscription = async (userId: string): Promise<boolean> => {
    const subscription = await getActiveSubscription(userId)
    return subscription !== null
  }

  return {
    createSubscription,
    updateSubscriptionStatus,
    getActiveSubscription,
    hasActiveSubscription,
    isLoading,
    error
  }
}
