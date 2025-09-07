import React, { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string, name?: string) => void
  isLoading: boolean
  error: string | null
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password, mode === 'register' ? name : undefined)
  }

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 16px 48px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
    color: '#1a202c',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  }

  const inputFocusStyle = {
    borderColor: '#4f46e5',
    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
  }

  const iconStyle = {
    position: 'absolute' as const,
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    transition: 'color 0.2s ease',
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <div className="input-group">
            <User size={20} style={iconStyle} />
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={mode === 'register'}
              style={inputStyle}
              onFocus={(e) => {
                Object.assign(e.target.style, inputFocusStyle)
              }}
              onBlur={(e) => {
                Object.assign(e.target.style, inputStyle)
              }}
            />
          </div>
        )}

        <div className="input-group">
          <Mail size={20} style={iconStyle} />
          <input
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              Object.assign(e.target.style, inputFocusStyle)
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, inputStyle)
            }}
          />
        </div>

        <div className="input-group">
          <Lock size={20} style={iconStyle} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => {
              Object.assign(e.target.style, inputFocusStyle)
            }}
            onBlur={(e) => {
              Object.assign(e.target.style, inputStyle)
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Создать аккаунт')}
        </button>
      </form>
    </div>
  )
}

export default AuthForm

