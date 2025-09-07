import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from '../AuthForm/AuthForm'
import YandexAuth from '../YandexAuth/YandexAuth'
import UserProfile from '../UserProfile/UserProfile'

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { authState, login, register } = useAuth()

  useEffect(() => {
    console.log('AuthScreen: Экран авторизации загружен')
  }, [])

  useEffect(() => {
    if (authState.user) {
      console.log('AuthScreen: Пользователь авторизован', authState.user)
      console.log('AuthScreen: Состояние isLoading:', authState.isLoading)
      console.log('AuthScreen: Состояние error:', authState.error)
    }
  }, [authState.user, authState.isLoading, authState.error])

  const handleAuth = async (email: string, password: string, name?: string) => {
    if (mode === 'login') {
      await login(email, password)
    } else {
      await register(email, password, name)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
  }

  console.log('AuthScreen: Рендер компонента, authState:', authState)

  if (authState.user) {
    console.log('AuthScreen: Отображение UserProfile для пользователя', authState.user)
    return <UserProfile />
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            {mode === 'login' ? 'Вход в систему' : 'Регистрация'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {mode === 'login' 
              ? 'Войдите в свой аккаунт' 
              : 'Создайте новый аккаунт'
            }
          </p>
        </div>

        <AuthForm
          mode={mode}
          onSubmit={handleAuth}
          isLoading={authState.isLoading}
          error={authState.error}
        />

        <YandexAuth />

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            {' '}
            <button
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen

