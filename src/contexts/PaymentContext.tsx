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
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    // Загружаем состояние оплаты из localStorage при инициализации
    const saved = localStorage.getItem('hasPaid')
    return saved === 'true'
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const { hasActiveSubscription } = useSubscriptions()
  const { authState } = useAuth()

  // Проверяем активную подписку при изменении пользователя
  useEffect(() => {
    const checkActiveSubscription = async () => {
      if (authState.user?.id) {
        console.log('Проверяем активную подписку для пользователя:', authState.user.id)
        const hasActive = await hasActiveSubscription(authState.user.id)
        console.log('Активная подписка найдена:', hasActive)
        setHasPaid(hasActive)
      } else {
        setHasPaid(false)
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

  return (
    <PaymentContext.Provider value={{
      hasPaid,
      setHasPaid,
      paymentModalOpen,
      setPaymentModalOpen,
      showPaymentModal,
      hidePaymentModal
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
