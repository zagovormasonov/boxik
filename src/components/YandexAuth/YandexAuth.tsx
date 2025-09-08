import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const YandexAuth: React.FC = () => {
  const { loginWithYandex, authState } = useAuth()

  const handleYandexLogin = async () => {
    try {
      await loginWithYandex()
    } catch (error) {
      console.error('YandexAuth: Ошибка входа через Яндекс', error)
    }
  }

  return (
    <div className="yandex-auth-container">
      <div className="auth-divider">
        <div className="divider-line" />
        <span className="divider-text">или</span>
        <div className="divider-line" />
      </div>

      <button
        onClick={handleYandexLogin}
        disabled={authState.isLoading}
        className="yandex-auth-button"
      >
        <div className="yandex-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#FFCC00"/>
            <path d="M8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h5v2H8v-2z" fill="#000"/>
          </svg>
        </div>
        <span className="yandex-button-text">
          {authState.isLoading ? 'Загрузка...' : 'Войти через Яндекс'}
        </span>
      </button>
    </div>
  )
}

export default YandexAuth

