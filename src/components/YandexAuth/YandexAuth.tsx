import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import yandexLogo from '../../img/yandex.png'

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
          <img 
            src={yandexLogo} 
            alt="Яндекс" 
            className="yandex-logo-image"
          />
        </div>
        <span className="yandex-button-text">
          {authState.isLoading ? 'Загрузка...' : 'Войти через Яндекс'}
        </span>
      </button>
    </div>
  )
}

export default YandexAuth

