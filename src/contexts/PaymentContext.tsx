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
  forceSetPaid: (paid: boolean) => void
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
          console.log('🔄 PaymentProvider: Supabase недоступен, используем fallback из localStorage для начальной проверки:', localHasPaid)
          console.log('🔄 PaymentProvider: Все значения localStorage:', {
            hasPaid: localStorage.getItem('hasPaid'),
            test_session_id: localStorage.getItem('test_session_id'),
            user: localStorage.getItem('user')
          })
          // Принудительно устанавливаем статус из localStorage
          setHasPaid(localHasPaid)
          console.log('🔄 PaymentProvider: Установлен hasPaid:', localHasPaid)
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
          console.log('🔄 PaymentContext: Supabase недоступен, используем fallback из localStorage:', localHasPaid)
          console.log('🔄 PaymentContext: Все значения localStorage:', {
            hasPaid: localStorage.getItem('hasPaid'),
            test_session_id: localStorage.getItem('test_session_id'),
            user: localStorage.getItem('user')
          })
          // Принудительно устанавливаем статус из localStorage
          setHasPaid(localHasPaid)
          console.log('🔄 PaymentContext: Установлен hasPaid:', localHasPaid)
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

  // Принудительная установка статуса оплаты (игнорирует Supabase)
  const forceSetPaid = (paid: boolean) => {
    console.log('🔄 PaymentContext: Принудительно устанавливаем hasPaid:', paid)
    setHasPaid(paid)
    localStorage.setItem('hasPaid', paid.toString())
    console.log('🔄 PaymentContext: hasPaid установлен в:', paid)
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
          console.log('🔄 PaymentContext: Supabase недоступен, используем fallback из localStorage для обновления:', localHasPaid)
          console.log('🔄 PaymentContext: Все значения localStorage:', {
            hasPaid: localStorage.getItem('hasPaid'),
            test_session_id: localStorage.getItem('test_session_id'),
            user: localStorage.getItem('user')
          })
          // Принудительно устанавливаем статус из localStorage
          setHasPaid(localHasPaid)
          console.log('🔄 PaymentContext: Установлен hasPaid:', localHasPaid)
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
      refreshPaymentStatus,
      forceSetPaid
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
