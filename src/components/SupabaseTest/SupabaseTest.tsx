import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Проверка...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log('SupabaseTest: Тестирование подключения к Supabase')
        
        // Тест 1: Проверка подключения
        const { data: connectionTest, error: connectionError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        if (connectionError) {
          throw new Error(`Ошибка подключения: ${connectionError.message}`)
        }
        
        console.log('SupabaseTest: Подключение успешно')
        setStatus('✅ Подключение к Supabase работает')
        
        // Тест 2: Проверка структуры таблицы
        const { data: tableTest, error: tableError } = await supabase
          .from('users')
          .select('*')
          .limit(1)
        
        if (tableError) {
          throw new Error(`Ошибка таблицы: ${tableError.message}`)
        }
        
        console.log('SupabaseTest: Таблица users доступна')
        setStatus('✅ Таблица users доступна')
        
        // Тест 3: Попытка вставки тестовой записи
        const testUser = {
          id: crypto.randomUUID(), // Генерируем правильный UUID
          email: `test_${Date.now()}@example.com`, // Уникальный email
          name: 'Тестовый пользователь',
          provider: 'test'
        }
        
        const { data: insertTest, error: insertError } = await supabase
          .from('users')
          .insert(testUser)
          .select()
        
        if (insertError) {
          throw new Error(`Ошибка вставки: ${insertError.message}`)
        }
        
        console.log('SupabaseTest: Тестовая запись создана', insertTest)
        setStatus('✅ Тестовая запись создана успешно')
        
        // Удаляем тестовую запись
        await supabase
          .from('users')
          .delete()
          .eq('id', testUser.id)
        
        console.log('SupabaseTest: Тестовая запись удалена')
        setStatus('✅ Supabase полностью работает!')
        
      } catch (err) {
        console.error('SupabaseTest: Ошибка тестирования', err)
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        setStatus('❌ Ошибка тестирования')
      }
    }
    
    testSupabase()
  }, [])

  return (
    <div style={{ 
      padding: '20px', 
      background: 'white', 
      borderRadius: '8px',
      margin: '20px',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>
        🔧 Тест подключения к Supabase
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Статус:</strong> {status}
      </div>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626'
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#f8fafc', 
        borderRadius: '6px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <strong>Инструкции:</strong>
        <br />1. Выполните SQL скрипт <code>supabase_users_check.sql</code> в Supabase
        <br />2. Проверьте, что таблица <code>users</code> создана
        <br />3. Убедитесь, что RLS политики настроены правильно
      </div>
    </div>
  )
}

export default SupabaseTest
