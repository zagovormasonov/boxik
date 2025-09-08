import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState } from '../types'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  authState: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  loginWithYandex: () => Promise<void>
  logout: () => void
  updateUser: (updatedUser: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null
  })

  useEffect(() => {
    console.log('AuthProvider: Контекст авторизации инициализирован')
    
    // Проверяем localStorage пользователя (для Яндекс OAuth)
    const checkLocalStorageUser = () => {
      const yandexUser = localStorage.getItem('yandex_user')
      const yandexAuthSuccess = localStorage.getItem('yandex_auth_success')
      
      if (yandexUser && yandexAuthSuccess === 'true') {
        console.log('AuthProvider: Найден пользователь в localStorage', yandexUser)
        
        try {
          const userData = JSON.parse(yandexUser)
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar
          }
          
          console.log('AuthProvider: Пользователь из localStorage', user)
          
          setAuthState({
            user,
            isLoading: false,
            error: null
          })
          
          return true
        } catch (error) {
          console.error('AuthProvider: Ошибка парсинга пользователя из localStorage', error)
          localStorage.removeItem('yandex_user')
          localStorage.removeItem('yandex_auth_success')
        }
      }
      
      return false
    }
    
    // Проверяем текущую сессию Supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('AuthProvider: Проверка текущей сессии', session)
      
      if (session?.user) {
        console.log('AuthProvider: Найдена активная сессия', session.user.id)
        // Получаем профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        console.log('AuthProvider: Профиль из getSession', profile, profileError)
        
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: profile?.name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
          avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url
        }
        
        console.log('AuthProvider: Пользователь из getSession', user)
        
        setAuthState({
          user,
          isLoading: false,
          error: null
        })
      } else {
        console.log('AuthProvider: Активная сессия не найдена')
        
        // Если нет сессии Supabase, НЕ сбрасываем состояние
        // Пользователь может быть в localStorage (Yandex)
        console.log('AuthProvider: Оставляем состояние как есть для localStorage пользователей')
      }
    }
    
    getSession()
    
    // Слушаем изменения состояния авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Изменение состояния авторизации', event, session)
        
        if (session?.user) {
          console.log('AuthProvider: Пользователь найден в сессии', session.user.id)
          
          // Получаем профиль пользователя
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          console.log('AuthProvider: Профиль пользователя', profile, profileError)
          
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || session.user.email!.split('@')[0],
            avatar: profile?.avatar_url || session.user.user_metadata?.avatar_url
          }
          
          console.log('AuthProvider: Создан объект пользователя', user)
          
          setAuthState({
            user,
            isLoading: false,
            error: null
          })
        } else {
          console.log('AuthProvider: Сессия завершена, проверяем localStorage')
          // Если сессия Supabase завершена, проверяем localStorage
          // Не сбрасываем состояние сразу, может быть пользователь из localStorage
          if (!checkLocalStorageUser()) {
            console.log('AuthProvider: Нет пользователя в localStorage, сбрасываем состояние')
            setAuthState({
              user: null,
              isLoading: false,
              error: null
            })
          } else {
            console.log('AuthProvider: Пользователь найден в localStorage, оставляем состояние')
          }
        }
      }
    )
    
    // Слушаем события успешной авторизации через Яндекс
    const handleYandexAuthSuccess = (event: CustomEvent) => {
      console.log('AuthProvider: Получено событие yandex-auth-success', event.detail)
      const { user } = event.detail
      
      // Обновляем состояние с пользователем из события
      setAuthState({
        user,
        isLoading: false,
        error: null
      })
    }
    
    window.addEventListener('yandex-auth-success', handleYandexAuthSuccess as EventListener)
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('yandex-auth-success', handleYandexAuthSuccess as EventListener)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      console.log('AuthProvider: Попытка входа', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        // Получаем профиль пользователя из таблицы users
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }
        
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
          avatar: profile?.avatar_url || data.user.user_metadata?.avatar_url
        }
        
        setAuthState({
          user,
          isLoading: false,
          error: null
        })
      }
    } catch (error: any) {
      console.error('AuthProvider: Ошибка входа', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Ошибка входа. Проверьте данные.'
      }))
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      console.log('AuthProvider: Попытка регистрации', { email, name })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      })
      
      if (error) {
        throw error
      }
      
      if (data.user) {
        // Создаем профиль пользователя в таблице users
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name || email.split('@')[0]
          })
        
        if (insertError) {
          console.error('AuthProvider: Ошибка создания профиля', insertError)
        }
        
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: name || email.split('@')[0]
        }
        
        setAuthState({
          user,
          isLoading: false,
          error: null
        })
      }
    } catch (error: any) {
      console.error('AuthProvider: Ошибка регистрации', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Ошибка регистрации. Попробуйте еще раз.'
      }))
    }
  }

  const loginWithYandex = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      console.log('AuthProvider: Попытка входа через Яндекс')
      
      // Альтернативный способ - прямая интеграция с Яндекс OAuth
      const yandexAuthUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${import.meta.env.VITE_YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/yandex/callback')}&force_confirm=true`
      
      // Сохраняем состояние для обработки после редиректа
      localStorage.setItem('yandex_auth_pending', 'true')
      
      // Редирект на Яндекс
      window.location.href = yandexAuthUrl
      
    } catch (error: any) {
      console.error('AuthProvider: Ошибка входа через Яндекс', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Ошибка входа через Яндекс'
      }))
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('AuthProvider: Ошибка выхода', error)
    } finally {
      // Очищаем localStorage пользователя
      localStorage.removeItem('yandex_user')
      localStorage.removeItem('yandex_auth_success')
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null
      })
    }
  }

  const updateUser = (updatedUser: User) => {
    console.log('AuthProvider: Обновление пользователя', updatedUser)
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }))
  }

  return (
    <AuthContext.Provider value={{
      authState,
      login,
      register,
      loginWithYandex,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

