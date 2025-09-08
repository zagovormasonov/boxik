import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSubscriptions } from '../shared/hooks/useSubscriptions'
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
  resetManualFlag: () => void
  setUserPaid: (userId: string) => Promise<boolean>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [hasPaid, setHasPaid] = useState<boolean>(false) // Инициализируем как false
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [isManuallySet, setIsManuallySet] = useState(false) // Флаг для ручной установки
  const { hasActiveSubscription } = useSubscriptions()
  const { getUserHasPaid, setUserPaid } = useUserHasPaid()
  const { authState } = useAuth()

  // Принудительная проверка статуса оплаты при инициализации
  useEffect(() => {
    const initialCheck = async () => {
      if (authState.user?.id) {
        console.log('PaymentProvider: Начальная проверка статуса оплаты для пользователя:', authState.user.id)
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
  }, [authState.user?.id, getUserHasPaid])

  // Проверяем активную подписку при изменении пользователя
  useEffect(() => {
    const checkActiveSubscription = async () => {
      if (authState.user?.id) {
        // Если hasPaid был установлен вручную, не перезаписываем его
        if (isManuallySet) {
          console.log('🔄 PaymentContext: hasPaid был установлен вручную в checkActiveSubscription, не перезаписываем')
          return
        }
        
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
        // Если пользователь не авторизован, НЕ сбрасываем hasPaid
        // Пользователь мог оплатить и потом разлогиниться
        console.log('🔄 PaymentContext: Пользователь не авторизован, сохраняем текущий hasPaid:', hasPaid)
        // Не изменяем hasPaid, оставляем как есть
      }
    }

    checkActiveSubscription()
  }, [authState.user?.id, hasActiveSubscription, isManuallySet, hasPaid])

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
  const forceSetPaid = async (paid: boolean) => {
    console.log('🔄 PaymentContext: Принудительно устанавливаем hasPaid:', paid)
    setHasPaid(paid)
    localStorage.setItem('hasPaid', paid.toString())
    setIsManuallySet(true) // Устанавливаем флаг ручной установки
    
    // Если есть пользователь, обновляем статус в БД
    if (authState.user?.id && paid) {
      try {
        await setUserPaid(authState.user.id)
        console.log('🔄 PaymentContext: Статус оплаты обновлен в БД для пользователя:', authState.user.id)
      } catch (error) {
        console.error('❌ PaymentContext: Ошибка при обновлении статуса в БД:', error)
      }
    }
    
    console.log('🔄 PaymentContext: hasPaid установлен в:', paid, 'isManuallySet:', true)
  }

  // Сброс флага ручной установки
  const resetManualFlag = () => {
    console.log('🔄 PaymentContext: Сбрасываем флаг isManuallySet')
    setIsManuallySet(false)
  }

  // Принудительное обновление статуса оплаты
  const refreshPaymentStatus = async () => {
    if (authState.user?.id) {
      console.log('🔄 Принудительно обновляем статус оплаты для пользователя:', authState.user.id)
      console.log('🔄 Текущий hasPaid перед обновлением:', hasPaid)
      console.log('🔄 localStorage hasPaid перед обновлением:', localStorage.getItem('hasPaid'))
      console.log('🔄 isManuallySet:', isManuallySet)
      
      // Если hasPaid был установлен вручную, не перезаписываем его
      if (isManuallySet) {
        console.log('🔄 PaymentContext: hasPaid был установлен вручную, не перезаписываем')
        return
      }
      
      try {
        const hasActive = await hasActiveSubscription(authState.user.id)
        console.log('🔄 Новый статус оплаты из Supabase:', hasActive)
        setHasPaid(hasActive)
        localStorage.setItem('hasPaid', hasActive.toString())
        console.log('🔄 hasPaid установлен в:', hasActive)
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
    } else {
      console.log('🔄 refreshPaymentStatus: Нет пользователя, сохраняем текущий hasPaid:', hasPaid)
      // Не сбрасываем hasPaid, пользователь мог оплатить и потом разлогиниться
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
      resetManualFlag,
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
