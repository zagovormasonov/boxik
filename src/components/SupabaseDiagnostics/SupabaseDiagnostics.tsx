import React, { useState, useEffect } from 'react'
import { Check, X, AlertTriangle, Database } from 'lucide-react'
import { useSubscriptions } from '../../shared/hooks/useSubscriptions'
import { supabase } from '../../lib/supabase'

const SupabaseDiagnostics: React.FC = () => {
  const { checkTableExists, error } = useSubscriptions()
  const [diagnostics, setDiagnostics] = useState<{
    tableExists: boolean | null
    connectionStatus: boolean | null
    authStatus: boolean | null
    error: string | null
  }>({
    tableExists: null,
    connectionStatus: null,
    authStatus: null,
    error: null
  })

  const runDiagnostics = async () => {
    setDiagnostics({
      tableExists: null,
      connectionStatus: null,
      authStatus: null,
      error: null
    })

    try {
      // Проверка подключения к Supabase
      console.log('🔍 Проверяем подключение к Supabase...')
      const { error: connectionError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      setDiagnostics(prev => ({
        ...prev,
        connectionStatus: !connectionError
      }))

      // Проверка авторизации
      const { data: { user } } = await supabase.auth.getUser()
      setDiagnostics(prev => ({
        ...prev,
        authStatus: !!user
      }))

      // Проверка таблицы subscriptions
      const tableExists = await checkTableExists()
      setDiagnostics(prev => ({
        ...prev,
        tableExists
      }))

    } catch (err) {
      setDiagnostics(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Неизвестная ошибка'
      }))
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertTriangle size={20} className="text-yellow-500" />
    return status ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />
  }

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'Проверяется...'
    return status ? 'OK' : 'Ошибка'
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <Database size={24} />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          Диагностика Supabase
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <span>Подключение к Supabase:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getStatusIcon(diagnostics.connectionStatus)}
            <span>{getStatusText(diagnostics.connectionStatus)}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <span>Авторизация пользователя:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getStatusIcon(diagnostics.authStatus)}
            <span>{getStatusText(diagnostics.authStatus)}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <span>Таблица subscriptions:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getStatusIcon(diagnostics.tableExists)}
            <span>{getStatusText(diagnostics.tableExists)}</span>
          </div>
        </div>

        {diagnostics.error && (
          <div style={{
            padding: '15px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <strong>Ошибка:</strong> {diagnostics.error}
          </div>
        )}

        {error && (
          <div style={{
            padding: '15px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <strong>Ошибка useSubscriptions:</strong> {error}
          </div>
        )}

        <button
          onClick={runDiagnostics}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Обновить диагностику
        </button>
      </div>
    </div>
  )
}

export default SupabaseDiagnostics
