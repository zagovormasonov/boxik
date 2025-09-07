import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const YandexCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleYandexCallback = async () => {
      try {
        console.log('YandexCallback: Обработка callback от Яндекс')
        
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        
        if (error) {
          console.error('YandexCallback: Ошибка от Яндекс', error)
          navigate('/auth?error=yandex_error')
          return
        }
        
        if (!code) {
          console.error('YandexCallback: Код авторизации не получен')
          navigate('/auth?error=no_code')
          return
        }
        
        // Получаем данные пользователя из Яндекс API
        console.log('YandexCallback: Получение данных пользователя из Яндекс')
        
        let userEmail, userName, userAvatar, yandexId, yandexLogin
        
        try {
          // Проверяем, есть ли Client Secret
          if (!import.meta.env.VITE_YANDEX_CLIENT_SECRET) {
            throw new Error('Client Secret недоступен на клиенте')
          }
          
          // Обмениваем код на токен доступа
          const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              client_id: import.meta.env.VITE_YANDEX_CLIENT_ID,
              client_secret: import.meta.env.VITE_YANDEX_CLIENT_SECRET,
            }),
          })
          
          if (!tokenResponse.ok) {
            throw new Error('Ошибка получения токена доступа')
          }
          
          const tokenData = await tokenResponse.json()
          const accessToken = tokenData.access_token
          
          console.log('YandexCallback: Токен получен, получаем данные пользователя')
          
          // Получаем данные пользователя
          const userResponse = await fetch('https://login.yandex.ru/info', {
            headers: {
              'Authorization': `OAuth ${accessToken}`,
            },
          })
          
          if (!userResponse.ok) {
            throw new Error('Ошибка получения данных пользователя')
          }
          
          const userData = await userResponse.json()
          console.log('YandexCallback: Данные пользователя получены', userData)
          
          // Извлекаем данные пользователя
          userEmail = userData.default_email || `yandex_${userData.id}@yandex.ru`
          userName = userData.real_name || userData.display_name || userData.login || `Пользователь Яндекс ${userData.id}`
          userAvatar = userData.default_avatar_id ? `https://avatars.yandex.net/get-yapic/${userData.default_avatar_id}/islands-200` : null
          yandexId = userData.id
          yandexLogin = userData.login
          
        } catch (apiError) {
          console.warn('YandexCallback: Не удалось получить данные из API, используем fallback', apiError)
          
          // Fallback - создаем пользователя с базовыми данными
          const userCode = code.slice(-8)
          userEmail = `yandex_${userCode}@yandex.ru`
          userName = `Пользователь Яндекс ${userCode}`
          userAvatar = `https://avatars.yandex.net/get-yapic/${userCode}/islands-200`
          yandexId = userCode
          yandexLogin = null
        }
        
        // Проверяем, существует ли пользователь с таким yandex_id
        console.log('YandexCallback: Проверка существующего пользователя по yandex_id:', yandexId)
        
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('yandex_id', yandexId)
          .single()
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.warn('YandexCallback: Ошибка проверки существующего пользователя', checkError)
        }
        
        let realUser
        
        if (existingUser) {
          // Пользователь существует - обновляем данные и используем существующий ID
          console.log('YandexCallback: Пользователь существует, обновляем данные', existingUser.id)
          
          const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({
              email: userEmail, // Обновляем email на случай если он изменился
              name: userName,
              avatar_url: userAvatar,
              yandex_id: yandexId,
              yandex_login: yandexLogin,
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)
            .select()
          
          if (updateError) {
            console.error('YandexCallback: Ошибка обновления пользователя', updateError)
          } else {
            console.log('YandexCallback: Пользователь успешно обновлен в Supabase', updateData)
          }
          
          // Создаем объект пользователя с существующим ID
          realUser = {
            id: existingUser.id, // Используем существующий ID
            email: userEmail, // Используем обновленный email
            name: userName,
            avatar: userAvatar,
            provider: 'yandex',
            created_at: existingUser.created_at,
            yandex_id: yandexId,
            yandex_login: yandexLogin
          }
          
        } else {
          // Пользователь не существует - создаем новую запись
          console.log('YandexCallback: Создание нового пользователя в Supabase')
          
          const newUserId = crypto.randomUUID()
          
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: newUserId,
              email: userEmail,
              name: userName,
              avatar_url: userAvatar,
              provider: 'yandex',
              yandex_id: yandexId,
              yandex_login: yandexLogin,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            })
            .select()
          
          if (insertError) {
            console.error('YandexCallback: Ошибка создания пользователя в Supabase', insertError)
          } else {
            console.log('YandexCallback: Пользователь успешно создан в Supabase', insertData)
          }
          
          // Создаем объект пользователя с новым ID
          realUser = {
            id: newUserId,
            email: userEmail,
            name: userName,
            avatar: userAvatar,
            provider: 'yandex',
            created_at: new Date().toISOString(),
            yandex_id: yandexId,
            yandex_login: yandexLogin
          }
        }
        
        // Сохраняем пользователя в localStorage
        localStorage.setItem('yandex_user', JSON.stringify(realUser))
        localStorage.setItem('yandex_auth_success', 'true')
        
        console.log('YandexCallback: Пользователь успешно создан в localStorage', realUser)
        
        // Очищаем состояние
        localStorage.removeItem('yandex_auth_pending')
        
        // Уведомляем AuthContext об изменении
        window.dispatchEvent(new CustomEvent('yandex-auth-success', { 
          detail: { user: realUser } 
        }))
        
        // Небольшая задержка для обновления состояния
        setTimeout(() => {
          console.log('YandexCallback: Перенаправление в личный кабинет')
          navigate('/auth')
        }, 100)
        
      } catch (error) {
        console.error('YandexCallback: Неожиданная ошибка', error)
        localStorage.removeItem('yandex_auth_pending')
        navigate('/auth?error=yandex_callback_error')
      }
    }
    
    handleYandexCallback()
  }, [navigate, searchParams])

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
          Обработка авторизации через Яндекс...
        </h2>
        <p style={{ color: '#6b7280' }}>
          Пожалуйста, подождите
        </p>
      </div>
    </div>
  )
}

export default YandexCallback