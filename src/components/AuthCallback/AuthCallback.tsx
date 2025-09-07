import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Обработка callback')
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthCallback: Ошибка получения сессии', error)
          navigate('/auth?error=callback_error')
          return
        }
        
        if (data.session?.user) {
          // Создаем или обновляем профиль пользователя
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: data.session.user.id,
              email: data.session.user.email!,
              name: data.session.user.user_metadata?.name || data.session.user.email!.split('@')[0],
              avatar_url: data.session.user.user_metadata?.avatar_url
            })
          
          if (upsertError) {
            console.error('AuthCallback: Ошибка создания профиля', upsertError)
          }
          
          console.log('AuthCallback: Пользователь авторизован', data.session.user)
          navigate('/auth')
        } else {
          navigate('/auth?error=no_session')
        }
      } catch (error) {
        console.error('AuthCallback: Неожиданная ошибка', error)
        navigate('/auth?error=unexpected')
      }
    }
    
    handleAuthCallback()
  }, [navigate])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#4f46e5' }}>
          Обработка авторизации...
        </h2>
        <p style={{ color: '#6b7280' }}>
          Пожалуйста, подождите
        </p>
      </div>
    </div>
  )
}

export default AuthCallback
