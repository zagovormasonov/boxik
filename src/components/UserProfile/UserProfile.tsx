import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Calendar, LogOut, RotateCcw, FileText } from 'lucide-react'
import { useBPDTestResults, BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'
import BPDTestResultCard from '../BPDTestResultCard/BPDTestResultCard'
import MascotRecommendation from '../MascotRecommendation/MascotRecommendation'
import PaymentModal from '../PaymentModal/PaymentModal'
import { usePaymentContext } from '../../contexts/PaymentContext'

const UserProfile: React.FC = () => {
  const { authState, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isSendingResults, setIsSendingResults] = useState(false)
  const { paymentModalOpen, setPaymentModalOpen, refreshPaymentStatus, hasPaid, forceSetPaid } = usePaymentContext()
  
  const { lastTestResult, isLoading: isLoadingResults, error: testError, sendToSpecialist } = useBPDTestResults(authState.user?.id || null)

  // Принудительно проверяем статус подписки при загрузке профиля
  useEffect(() => {
    if (authState.user?.id) {
      console.log('UserProfile: Принудительно проверяем статус подписки для пользователя:', authState.user.id)
      console.log('UserProfile: Текущий hasPaid:', hasPaid)
      console.log('UserProfile: localStorage hasPaid:', localStorage.getItem('hasPaid'))
      
      // Принудительно проверяем localStorage и устанавливаем hasPaid если нужно
      const localHasPaid = localStorage.getItem('hasPaid') === 'true'
      if (localHasPaid && !hasPaid) {
        console.log('UserProfile: Принудительно устанавливаем hasPaid: true из localStorage')
        forceSetPaid(true)
      }
      
      refreshPaymentStatus()
    }
  }, [authState.user?.id, refreshPaymentStatus, hasPaid, forceSetPaid])

  // Логируем изменения hasPaid
  useEffect(() => {
    console.log('UserProfile: hasPaid изменился на:', hasPaid)
  }, [hasPaid])

  // Проверяем параметры оплаты в URL
  useEffect(() => {
    const paymentId = searchParams.get('PaymentId') || searchParams.get('payment_id') || searchParams.get('PaymentID')
    const orderId = searchParams.get('OrderId') || searchParams.get('order_id') || searchParams.get('OrderID')
    const status = searchParams.get('Status') || searchParams.get('status')
    
    console.log('UserProfile: Проверяем параметры оплаты в URL:', {
      paymentId,
      orderId,
      status,
      allParams: Object.fromEntries(searchParams.entries())
    })
    
    // Если есть параметры оплаты, автоматически устанавливаем hasPaid: true
    if (paymentId || orderId) {
      console.log('UserProfile: Обнаружены параметры оплаты, автоматически устанавливаем hasPaid: true')
      forceSetPaid(true)
      
      // Очищаем URL от параметров оплаты
      const newUrl = new URL(window.location.href)
      newUrl.search = ''
      window.history.replaceState({}, '', newUrl.toString())
      console.log('UserProfile: URL очищен от параметров оплаты')
    }
  }, [searchParams, forceSetPaid])

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

  const handleRetakeTest = () => {
    navigate('/')
  }

  const handleManualSetPaid = () => {
    console.log('🔄 UserProfile: Ручная установка hasPaid: true')
    forceSetPaid(true)
    console.log('🔄 UserProfile: hasPaid установлен в true, localStorage:', localStorage.getItem('hasPaid'))
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
          
          {/* Кнопка для отладки - принудительная установка hasPaid */}
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={handleManualSetPaid}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔧 Принудительно установить hasPaid: true
            </button>
            <p style={{ fontSize: '10px', color: '#6b7280', margin: '5px 0 0 0' }}>
              hasPaid: {hasPaid ? 'true' : 'false'} | localStorage: {localStorage.getItem('hasPaid')}
            </p>
          </div>
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
          
          <div className="info-item">
            <Mail size={18} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{authState.user?.email || 'Не указан'}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Calendar size={18} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Дата регистрации</span>
              <span className="info-value">{authState.user?.created_at ? new Date(authState.user.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}</span>
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
          <div className="no-test-message">
            <h3>Ошибка загрузки</h3>
            <p>{testError}</p>
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
            <h3>Тесты не пройдены</h3>
            <p>Пройдите тест, чтобы увидеть результаты здесь</p>
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
            onClick={logout}
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