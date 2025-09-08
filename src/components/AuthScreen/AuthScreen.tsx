import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePaymentContext } from '../../contexts/PaymentContext'
import AuthForm from '../AuthForm/AuthForm'
import YandexAuth from '../YandexAuth/YandexAuth'

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { authState, login, register } = useAuth()
  const { hasPaid } = usePaymentContext()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('AuthScreen: Экран авторизации загружен')
  }, [])

  useEffect(() => {
    if (authState.user) {
      console.log('AuthScreen: Пользователь авторизован, переходим в профиль', authState.user)
      navigate('/profile')
    }
  }, [authState.user, navigate])

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

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        {/* Сообщение об успешной оплате */}
        {hasPaid && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
              ✅ Оплата успешно завершена!
            </h3>
            <p style={{ margin: '0', fontSize: '14px', opacity: 0.9 }}>
              Теперь авторизуйтесь, чтобы получить доступ к результатам теста
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1f2937'
          }}>
            {hasPaid 
              ? (mode === 'login' ? 'Вход для доступа к результатам' : 'Регистрация для доступа к результатам')
              : (mode === 'login' ? 'Вход в систему' : 'Регистрация')
            }
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {hasPaid 
              ? (mode === 'login' 
                  ? 'Войдите в аккаунт, чтобы получить доступ к результатам теста' 
                  : 'Создайте аккаунт, чтобы получить доступ к результатам теста'
                )
              : (mode === 'login' 
                  ? 'Войдите в свой аккаунт' 
                  : 'Создайте новый аккаунт'
                )
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

