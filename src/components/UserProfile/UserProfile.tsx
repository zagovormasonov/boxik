import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { User, LogOut, RotateCcw, FileText } from 'lucide-react'
import { useBPDTestResults, BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'
// import { useUserHasPaid } from '../../shared/hooks/useUserHasPaid' // Убрано, так как больше не используется
import BPDTestResultCard from '../BPDTestResultCard/BPDTestResultCard'
import MascotRecommendation from '../MascotRecommendation/MascotRecommendation'
import PaymentModal from '../PaymentModal/PaymentModal'
import { usePaymentContext } from '../../contexts/PaymentContext'
import { useUserHasPaid } from '../../shared/hooks/useUserHasPaid'

const UserProfile: React.FC = () => {
  const { authState, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSendingResults, setIsSendingResults] = useState(false)
  const [hasTriedForceReload, setHasTriedForceReload] = useState(false)
  const { paymentModalOpen, setPaymentModalOpen, refreshPaymentStatus, hasPaid, forceSetPaid } = usePaymentContext()
  const { getUserHasPaid } = useUserHasPaid()
  
  const { lastTestResult, isLoading: isLoadingResults, error: testError, sendToSpecialist, forceReload } = useBPDTestResults(authState.user?.id || null)
  
  console.log('UserProfile: Передаем в useBPDTestResults userId:', authState.user?.id || null)

  console.log('UserProfile: Компонент загружен, hasPaid:', hasPaid, 'authState.user:', authState.user?.id)
  console.log('UserProfile: Referrer:', document.referrer)
  console.log('UserProfile: Состояние результатов теста:', { 
    lastTestResult: lastTestResult ? 'есть' : 'нет', 
    isLoading: isLoadingResults, 
    error: testError 
  })

  // Проверяем статус подписки только при первой загрузке (один раз)
  useEffect(() => {
    if (authState.user?.id) {
      console.log('UserProfile: Проверяем статус подписки для пользователя:', authState.user.id)
      refreshPaymentStatus()
    }
  }, [authState.user?.id]) // Убираем refreshPaymentStatus из зависимостей

  // Принудительная проверка результатов теста (только один раз)
  useEffect(() => {
    if (authState.user?.id && hasPaid && !lastTestResult && !isLoadingResults && !hasTriedForceReload) {
      console.log('UserProfile: Принудительно проверяем результаты теста для оплатившего пользователя')
      console.log('UserProfile: Состояние для принудительной проверки:', { 
        userId: authState.user.id, 
        hasPaid, 
        lastTestResult: lastTestResult ? 'есть' : 'нет', 
        isLoadingResults,
        hasTriedForceReload
      })
      
      // Показываем сообщение пользователю вместо перезагрузки
      console.log('UserProfile: Результаты теста не найдены для оплатившего пользователя')
      
      // Принудительно сбрасываем флаг hasLoaded для повторной загрузки (только один раз)
      console.log('UserProfile: Принудительно сбрасываем флаг hasLoaded для повторной загрузки')
      setHasTriedForceReload(true)
      setTimeout(() => {
        forceReload()
      }, 1000) // Задержка в 1 секунду
    }
  }, [authState.user?.id, hasPaid, lastTestResult, isLoadingResults, hasTriedForceReload]) // Добавляем hasTriedForceReload в зависимости

  // Проверяем, должен ли пользователь быть перенаправлен на оплату (только один раз)
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (authState.user?.id) {
        console.log('UserProfile: Проверяем статус оплаты для пользователя:', authState.user.id)
        console.log('UserProfile: Статус оплаты в контексте:', hasPaid)
        
        // Если контекст уже показывает оплату, остаемся в ЛК
        if (hasPaid) {
          console.log('UserProfile: Контекст показывает оплату, остаемся в ЛК')
          return
        }
        
        // Проверяем, не пришел ли пользователь после оплаты (по referrer)
        const isFromTinkoff = document.referrer.includes('tinkoff.ru') || document.referrer.includes('securepay.tinkoff.ru')
        if (isFromTinkoff) {
          console.log('UserProfile: Пользователь пришел от Тинькофф, даем время для обновления статуса')
          // Даем время для обновления статуса в БД
          setTimeout(async () => {
            if (authState.user?.id) {
              try {
                const dbHasPaid = await getUserHasPaid(authState.user.id)
                console.log('UserProfile: Повторная проверка статуса после Тинькофф:', dbHasPaid)
                if (dbHasPaid) {
                  console.log('UserProfile: Статус обновился, синхронизируем контекст')
                  forceSetPaid(true)
                  return
                }
              } catch (error) {
                console.error('UserProfile: Ошибка при повторной проверке:', error)
              }
            }
          }, 2000) // Ждем 2 секунды
        }
        
        try {
          const dbHasPaid = await getUserHasPaid(authState.user.id)
          console.log('UserProfile: Статус оплаты в БД:', dbHasPaid)
          
          if (dbHasPaid && !hasPaid) {
            console.log('UserProfile: БД показывает оплату, но контекст нет - обновляем контекст')
            forceSetPaid(true)
            return // Не перенаправляем, остаемся в ЛК
          }
          
          if (!dbHasPaid && !hasPaid) {
            console.log('UserProfile: Пользователь не оплатил, перенаправляем на AuthSuccessScreen')
            navigate('/auth-success')
          }
        } catch (error) {
          console.error('UserProfile: Ошибка проверки статуса оплаты:', error)
          // В случае ошибки перенаправляем на оплату
          navigate('/auth-success')
        }
      }
    }

    // Добавляем небольшую задержку, чтобы PaymentProvider успел инициализироваться
    const timeoutId = setTimeout(checkPaymentStatus, 100)
    
    return () => clearTimeout(timeoutId)
  }, [authState.user?.id]) // Убираем hasPaid и другие зависимости

  // Проверяем параметры оплаты в URL
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentId = searchParams.get('PaymentId') || searchParams.get('payment_id') || searchParams.get('PaymentID')
      const orderId = searchParams.get('OrderId') || searchParams.get('order_id') || searchParams.get('OrderID')
      const status = searchParams.get('Status') || searchParams.get('status')
      const success = searchParams.get('Success') || searchParams.get('success')
      const result = searchParams.get('Result') || searchParams.get('result')
      
      console.log('UserProfile: Проверяем параметры оплаты в URL:')
      console.log('- paymentId:', paymentId)
      console.log('- orderId:', orderId)
      console.log('- status:', status)
      console.log('- success:', success)
      console.log('- result:', result)
      console.log('- allParams:', Object.fromEntries(searchParams.entries()))
      console.log('- current URL:', window.location.href)
      
      // Убираем автоматическую установку hasPaid - статус должен устанавливаться только в PaymentCallback
      console.log('UserProfile: Параметры оплаты обнаружены, но не устанавливаем hasPaid автоматически')
    }
    
    checkPaymentStatus()
  }, [searchParams]) // Убираем лишние зависимости

  useEffect(() => {
    // Добавляем небольшую задержку для восстановления пользователя из localStorage
    const timer = setTimeout(() => {
      if (!authState.user) {
        console.log('UserProfile: Пользователь не авторизован после задержки, перенаправляем на тест')
        navigate('/')
      }
    }, 1000) // 1 секунда задержки

    return () => clearTimeout(timer)
  }, [authState.user, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      // Все равно перенаправляем на главную
      navigate('/')
    }
  }

  const handleRetakeTest = () => {
    navigate('/')
  }


  const handleSendToSpecialist = async (testResult: BPDTestResultWithDetails): Promise<boolean> => {
    setIsSendingResults(true)
    try {
      const success = await sendToSpecialist(testResult)
      return success
    } catch (error) {
      console.error('Ошибка при отправке результатов:', error)
      return false
    } finally {
      setIsSendingResults(false)
    }
  }

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false)
  }

  console.log('UserProfile: Рендерим личный кабинет для', authState.user?.name)

  // Показываем загрузку, если пользователь еще не восстановлен
  if (!authState.user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Восстанавливаем сессию...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Заголовок */}
        <div className="profile-header">
          <h1 className="profile-title">
            Личный кабинет
          </h1>
          <p className="profile-subtitle">
            Добро пожаловать, {authState.user?.name || 'Пользователь'}!
          </p>
          
        </div>

        {/* Аватар */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {authState.user?.avatar ? (
              <img 
                src={authState.user.avatar} 
                alt="Аватар" 
                className="avatar-image"
              />
            ) : (
              <User size={32} className="avatar-icon" />
            )}
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="profile-info">
          <div className="info-item">
            <User size={18} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Имя</span>
              <span className="info-value">{authState.user?.name || 'Не указано'}</span>
            </div>
          </div>
          
        </div>

        {/* Результаты теста */}
        {isLoadingResults ? (
          <div className="no-test-message">
            <h3>Загрузка результатов...</h3>
            <p>Получаем данные о последнем тесте</p>
          </div>
        ) : testError ? (
          <div className="error-message">
            <h3>Ошибка загрузки результатов</h3>
            <p>Не удалось загрузить результаты тестов: {testError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="action-button action-button-primary"
            >
              Попробовать снова
            </button>
          </div>
        ) : lastTestResult ? (
          <>
            <BPDTestResultCard 
              testResult={lastTestResult}
              onSendToSpecialist={handleSendToSpecialist}
              isSending={isSendingResults}
            />
            <MascotRecommendation testResult={lastTestResult} />
          </>
        ) : (
          <div className="no-test-message">
            <FileText size={48} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
            <h3>Результаты теста не найдены</h3>
            <p>
              {hasPaid 
                ? 'Возможно, результаты теста еще не загружены. Попробуйте пройти тест заново.'
                : 'Пройдите тест, чтобы увидеть результаты здесь'
              }
            </p>
            {hasPaid && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
                <button 
                  onClick={() => navigate('/test')} 
                  className="action-button action-button-primary"
                >
                  Пройти тест заново
                </button>
                <button 
                  onClick={() => {
                    setHasTriedForceReload(false)
                    forceReload()
                  }} 
                  className="action-button action-button-secondary"
                >
                  Обновить результаты
                </button>
              </div>
            )}
          </div>
        )}

        {/* Кнопки действий */}
        <div className="profile-actions">
          <button
            onClick={handleRetakeTest}
            className="action-button action-button-primary"
          >
            <RotateCcw size={20} />
            Пройти тест снова
          </button>
          
          <button
            onClick={handleLogout}
            className="action-button action-button-secondary"
          >
            <LogOut size={20} />
            Выйти из аккаунта
          </button>
        </div>
      </div>

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        amount={1}
        description="Доступ к результатам психологического теста БПД и возможность скачивания PDF отчета"
        userId={authState.user?.id}
        userEmail={authState.user?.email}
      />
    </div>
  )
}

export default UserProfile