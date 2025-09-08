import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSubscriptions } from '../shared/hooks/useSubscriptions'
import { useAuth } from './AuthContext'

interface PaymentContextType {
  hasPaid: boolean
  setHasPaid: (paid: boolean) => void
  paymentModalOpen: boolean
  setPaymentModalOpen: (open: boolean) => void
  showPaymentModal: () => void
  hidePaymentModal: () => void
  refreshPaymentStatus: () => Promise<void>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    // Загружаем состояние оплаты из localStorage при инициализации
    const saved = localStorage.getItem('hasPaid')
    console.log('PaymentProvider: Инициализация с hasPaid из localStorage:', saved)
    return saved === 'true'
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const { hasActiveSubscription } = useSubscriptions()
  const { authState } = useAuth()

  // Принудительная проверка подписки при инициализации
  useEffect(() => {
    const initialCheck = async () => {
      if (authState.user?.id) {
        console.log('PaymentProvider: Начальная проверка подписки для пользователя:', authState.user.id)
        try {
          const hasActive = await hasActiveSubscription(authState.user.id)
          console.log('PaymentProvider: Начальная проверка - активная подписка:', hasActive)
          setHasPaid(hasActive)
          localStorage.setItem('hasPaid', hasActive.toString())
        } catch (error) {
          console.error('PaymentProvider: Ошибка при начальной проверке подписки:', error)
          // Fallback: используем localStorage если Supabase недоступен
          const localHasPaid = localStorage.getItem('hasPaid') === 'true'
          console.log('🔄 PaymentProvider: Используем fallback из localStorage для начальной проверки:', localHasPaid)
          setHasPaid(localHasPaid)
        }
      }
    }
    
    initialCheck()
  }, []) // Выполняем только при инициализации

  // Проверяем активную подписку при изменении пользователя
  useEffect(() => {
    const checkActiveSubscription = async () => {
      if (authState.user?.id) {
        try {
          const hasActive = await hasActiveSubscription(authState.user.id)
          setHasPaid(hasActive)
          localStorage.setItem('hasPaid', hasActive.toString())
        } catch (error) {
          console.error('❌ PaymentContext: Ошибка при проверке подписки:', error)
          // Fallback: проверяем localStorage если Supabase недоступен
          const localHasPaid = localStorage.getItem('hasPaid') === 'true'
          console.log('🔄 PaymentContext: Используем fallback из localStorage:', localHasPaid)
          setHasPaid(localHasPaid)
        }
      } else {
        setHasPaid(false)
        localStorage.setItem('hasPaid', 'false')
      }
    }

    checkActiveSubscription()
  }, [authState.user?.id, hasActiveSubscription])

  // Сохраняем состояние оплаты в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('hasPaid', hasPaid.toString())
  }, [hasPaid])

  const showPaymentModal = () => {
    setPaymentModalOpen(true)
  }

  const hidePaymentModal = () => {
    setPaymentModalOpen(false)
  }

  // Принудительное обновление статуса оплаты
  const refreshPaymentStatus = async () => {
    if (authState.user?.id) {
      console.log('🔄 Принудительно обновляем статус оплаты для пользователя:', authState.user.id)
      try {
        const hasActive = await hasActiveSubscription(authState.user.id)
        console.log('🔄 Новый статус оплаты:', hasActive)
        setHasPaid(hasActive)
        localStorage.setItem('hasPaid', hasActive.toString())
      } catch (error) {
        console.error('❌ PaymentContext: Ошибка при обновлении статуса оплаты:', error)
        // Fallback: используем localStorage если Supabase недоступен
        const localHasPaid = localStorage.getItem('hasPaid') === 'true'
        console.log('🔄 PaymentContext: Используем fallback из localStorage для обновления:', localHasPaid)
        setHasPaid(localHasPaid)
      }
    }
  }

  return (
    <PaymentContext.Provider value={{
      hasPaid,
      setHasPaid,
      paymentModalOpen,
      setPaymentModalOpen,
      showPaymentModal,
      hidePaymentModal,
      refreshPaymentStatus
    }}>
      {children}
    </PaymentContext.Provider>
  )
}

export function usePaymentContext() {
  const context = useContext(PaymentContext)
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider')
  }
  return context
}
