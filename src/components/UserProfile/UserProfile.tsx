import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      background: '#f8fafc'
    }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Простой заголовок для диагностики */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            🎉 Личный кабинет работает!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Добро пожаловать, {authState.user.name}!
          </p>
        </div>

        {/* Аватар */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: authState.user.avatar ? 'none' : '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {authState.user.avatar ? (
              <img 
                src={authState.user.avatar} 
                alt="Аватар" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            ) : (
              <span style={{ color: 'white', fontSize: '24px' }}>👤</span>
            )}
          </div>
        </div>

        {/* Информация о пользователе */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            {authState.user.name}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {authState.user.email}
          </p>
        </div>

        {/* Простые кнопки */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleRetakeTest}
            style={{ 
              width: '100%',
              padding: '12px 24px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🧪 Пройти тест снова
          </button>
          
          <button
            onClick={handleLogout}
            style={{ 
              width: '100%',
              padding: '12px 24px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🚪 Выйти из аккаунта
          </button>
        </div>

        {/* Дополнительная информация */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f8fafc', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <span>Зарегистрирован: {new Date().toLocaleDateString('ru-RU')}</span>
        </div>
      </div>
    </div>
  )
}

export default UserProfile