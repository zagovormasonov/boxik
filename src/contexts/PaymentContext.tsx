import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUserHasPaid } from '../shared/hooks/useUserHasPaid'
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
  setUserPaid: (userId: string) => Promise<boolean>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [hasPaid, setHasPaid] = useState<boolean>(() => {
    // Инициализируем из localStorage как fallback
    const saved = localStorage.getItem('hasPaid')
    return saved === 'true'
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false) // Флаг инициализации
  const { getUserHasPaid, setUserPaid } = useUserHasPaid()
  const { authState } = useAuth()

  // Принудительная проверка статуса оплаты при инициализации (только один раз)
  useEffect(() => {
    const initialCheck = async () => {
      // Проверяем, что пользователь авторизован и мы еще не инициализировались
      if (authState.user?.id && !isInitialized) {
        console.log('PaymentProvider: Начальная проверка статуса оплаты для пользователя:', authState.user.id)
        setIsInitialized(true) // Помечаем как инициализированный
        
        try {
          // Получаем статус оплаты из базы данных
          const userHasPaid = await getUserHasPaid(authState.user.id)
          console.log('PaymentProvider: Начальная проверка - статус оплаты из БД:', userHasPaid)
          setHasPaid(userHasPaid)
        } catch (error) {
          console.error('PaymentProvider: Ошибка при начальной проверке статуса оплаты:', error)
          // Fallback: используем localStorage если БД недоступна
          const localHasPaid = localStorage.getItem('hasPaid') === 'true'
          console.log('🔄 PaymentProvider: БД недоступна, используем fallback из localStorage:', localHasPaid)
          setHasPaid(localHasPaid)
        }
      }
    }
    
    initialCheck()
  }, [authState.user?.id, isInitialized, getUserHasPaid])

  // Сохраняем состояние оплаты в localStorage при изменении (fallback)
  useEffect(() => {
    localStorage.setItem('hasPaid', hasPaid.toString())
  }, [hasPaid])

  const showPaymentModal = () => {
    setPaymentModalOpen(true)
  }

  const hidePaymentModal = () => {
    setPaymentModalOpen(false)
  }

  // Принудительная установка статуса оплаты
  const forceSetPaid = async (paid: boolean) => {
    console.log('🔄 PaymentContext: Принудительно устанавливаем hasPaid:', paid)
    setHasPaid(paid)
    localStorage.setItem('hasPaid', paid.toString())
    
    // Если есть пользователь, обновляем статус в БД
    if (authState.user?.id && paid) {
      try {
        await setUserPaid(authState.user.id)
        console.log('🔄 PaymentContext: Статус оплаты обновлен в БД для пользователя:', authState.user.id)
      } catch (error) {
        console.error('❌ PaymentContext: Ошибка при обновлении статуса в БД:', error)
      }
    }
    
    console.log('🔄 PaymentContext: hasPaid установлен в:', paid)
  }

  // Принудительное обновление статуса оплаты
  const refreshPaymentStatus = async () => {
    if (authState.user?.id) {
      console.log('🔄 Принудительно обновляем статус оплаты для пользователя:', authState.user.id)
      try {
        // Получаем статус оплаты из БД
        const userHasPaid = await getUserHasPaid(authState.user.id)
        console.log('🔄 Статус оплаты из БД:', userHasPaid)
        setHasPaid(userHasPaid)
      } catch (error) {
        console.error('❌ PaymentContext: Ошибка при обновлении статуса оплаты:', error)
        // Fallback: используем localStorage если БД недоступна
        const localHasPaid = localStorage.getItem('hasPaid') === 'true'
        console.log('🔄 PaymentContext: БД недоступна, используем fallback из localStorage:', localHasPaid)
        setHasPaid(localHasPaid)
      }
    } else {
      console.log('🔄 refreshPaymentStatus: Нет пользователя, сохраняем текущий hasPaid:', hasPaid)
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
      forceSetPaid,
      setUserPaid
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
