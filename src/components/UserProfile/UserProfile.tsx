import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [isSendingResults, setIsSendingResults] = useState(false)
  const { paymentModalOpen, setPaymentModalOpen, refreshPaymentStatus } = usePaymentContext()
  
  const { lastTestResult, isLoading: isLoadingResults, error: testError, sendToSpecialist } = useBPDTestResults(authState.user?.id || null)

  // Принудительно проверяем статус подписки при загрузке профиля
  useEffect(() => {
    if (authState.user?.id) {
      console.log('UserProfile: Принудительно проверяем статус подписки для пользователя:', authState.user.id)
      refreshPaymentStatus()
    }
  }, [authState.user?.id, refreshPaymentStatus])

  useEffect(() => {
    if (!authState.user) {
      console.log('UserProfile: Пользователь не авторизован, перенаправляем на тест')
      navigate('/')
    }
  }, [authState.user, navigate])

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
        amount={200}
        description="Доступ к результатам психологического теста БПД и возможность скачивания PDF отчета"
        userId={authState.user?.id}
        userEmail={authState.user?.email}
      />
    </div>
  )
}

export default UserProfile