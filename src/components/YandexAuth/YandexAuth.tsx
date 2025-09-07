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
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '16px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        <span>или</span>
        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      </div>

      <button
        onClick={handleYandexLogin}
        disabled={authState.isLoading}
        style={{
          width: '100%',
          padding: '12px 24px',
          border: '2px solid #ffcc00',
          borderRadius: '8px',
          background: 'white',
          color: '#000',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        {authState.isLoading ? 'Загрузка...' : 'Войти через Яндекс'}
      </button>
    </div>
  )
}

export default YandexAuth

