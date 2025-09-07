import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Calendar, LogOut, RotateCcw } from 'lucide-react'

const UserProfile: React.FC = () => {
  const { authState, logout } = useAuth()
  const navigate = useNavigate()

  console.log('UserProfile: Рендер компонента, authState:', authState)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('UserProfile: Ошибка выхода', error)
    }
  }

  const handleRetakeTest = () => {
    navigate('/')
  }

  if (!authState.user) {
    console.log('UserProfile: Пользователь не найден, возвращаем null')
    return null
  }

  console.log('UserProfile: Рендерим личный кабинет для', authState.user.name)

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Заголовок */}
        <div className="profile-header">
          <h1 className="profile-title">
            Личный кабинет
          </h1>
          <p className="profile-subtitle">
            Добро пожаловать, {authState.user.name}!
          </p>
        </div>

        {/* Аватар */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {authState.user.avatar ? (
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
              <span className="info-value">{authState.user.name}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Mail size={18} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{authState.user.email}</span>
            </div>
          </div>
          
          <div className="info-item">
            <Calendar size={18} className="info-icon" />
            <div className="info-content">
              <span className="info-label">Дата регистрации</span>
              <span className="info-value">{new Date().toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>

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
    </div>
  )
}

export default UserProfile