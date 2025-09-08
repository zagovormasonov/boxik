import React, { useState } from 'react'
import { Edit3, Save, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface EditProfileProps {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
  }
  onUpdate: (updatedUser: any) => void
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Имя не может быть пустым')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Обновляем профиль в таблице users
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Обновляем user_metadata в Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: name.trim() }
      })

      if (authError) {
        console.warn('Не удалось обновить user_metadata:', authError)
      }

      // Обновляем локальное состояние
      const updatedUser = {
        ...user,
        name: name.trim()
      }

      onUpdate(updatedUser)
      setIsEditing(false)

    } catch (err: any) {
      console.error('Ошибка обновления профиля:', err)
      setError(err.message || 'Ошибка обновления профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(user.name || '')
    setError(null)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="edit-profile-section">
        <div className="edit-profile-header">
          <h3>Профиль пользователя</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="edit-button"
            title="Редактировать профиль"
          >
            <Edit3 size={16} />
            Редактировать
          </button>
        </div>
        
        <div className="profile-display">
          <div className="profile-field">
            <span className="field-label">Имя:</span>
            <span className="field-value">
              {user.name || 'Не указано'}
            </span>
          </div>
          <div className="profile-field">
            <span className="field-label">Email:</span>
            <span className="field-value">{user.email}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-profile-section">
      <div className="edit-profile-header">
        <h3>Редактирование профиля</h3>
        <div className="edit-actions">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="save-button"
          >
            <Save size={16} />
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="cancel-button"
          >
            <X size={16} />
            Отмена
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="edit-form">
        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше имя"
            className="form-input"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="form-input disabled"
          />
          <small className="form-help">
            Email нельзя изменить
          </small>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
