import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader, RefreshCcw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSubscriptions } from '../../shared/hooks/useSubscriptions'
import { useTestUserMapping } from '../../shared/hooks/useTestUserMapping'

interface DiagnosticsState {
  connectionStatus: boolean | null
  authStatus: boolean | null
  subscriptionsTableExists: boolean | null
  testUserMappingTableExists: boolean | null
  error: string | null
}

const SupabaseDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    connectionStatus: null,
    authStatus: null,
    subscriptionsTableExists: null,
    testUserMappingTableExists: null,
    error: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const { checkTableExists: checkSubscriptionsTable } = useSubscriptions()
  const { checkTableExists: checkTestUserMappingTable } = useTestUserMapping()

  const runDiagnostics = async () => {
    setIsLoading(true)
    setDiagnostics({
      connectionStatus: null,
      authStatus: null,
      subscriptionsTableExists: null,
      testUserMappingTableExists: null,
      error: null
    })

    try {
      // 1. Проверка подключения к Supabase
      console.log('🔍 Проверяем подключение к Supabase...')
      const { error: connectionError } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      setDiagnostics(prev => ({
        ...prev,
        connectionStatus: !connectionError
      }))

      // 2. Проверка авторизации пользователя
      console.log('🔍 Проверяем авторизацию пользователя...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      setDiagnostics(prev => ({
        ...prev,
        authStatus: !!user && !authError
      }))

      // 3. Проверка существования таблицы subscriptions
      console.log('🔍 Проверяем существование таблицы subscriptions...')
      const subsTableExists = await checkSubscriptionsTable()
      setDiagnostics(prev => ({
        ...prev,
        subscriptionsTableExists: subsTableExists
      }))

      // 4. Проверка существования таблицы test_user_mapping
      console.log('🔍 Проверяем существование таблицы test_user_mapping...')
      const mappingTableExists = await checkTestUserMappingTable()
      setDiagnostics(prev => ({
        ...prev,
        testUserMappingTableExists: mappingTableExists
      }))

    } catch (err) {
      console.error('❌ Ошибка при выполнении диагностики Supabase:', err)
      setDiagnostics(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Неизвестная ошибка диагностики'
      }))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const renderStatus = (status: boolean | null) => {
    if (status === null) return <Loader size={16} className="animate-spin text-gray-500" />
    return status ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Диагностика Supabase</h3>
      {isLoading && <p className="text-gray-600 mb-2 flex items-center gap-2"><Loader size={16} className="animate-spin" /> Выполняем диагностику...</p>}
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          {renderStatus(diagnostics.connectionStatus)}
          <span>Подключение к Supabase: {diagnostics.connectionStatus === true ? 'OK' : diagnostics.connectionStatus === false ? 'Ошибка' : 'Проверка...'}</span>
        </li>
        <li className="flex items-center gap-2">
          {renderStatus(diagnostics.authStatus)}
          <span>Авторизация пользователя: {diagnostics.authStatus === true ? 'OK' : diagnostics.authStatus === false ? 'Ошибка' : 'Проверка...'}</span>
        </li>
        <li className="flex items-center gap-2">
          {renderStatus(diagnostics.subscriptionsTableExists)}
          <span>Таблица 'subscriptions': {diagnostics.subscriptionsTableExists === true ? 'Существует' : diagnostics.subscriptionsTableExists === false ? 'Отсутствует' : 'Проверка...'}</span>
        </li>
        <li className="flex items-center gap-2">
          {renderStatus(diagnostics.testUserMappingTableExists)}
          <span>Таблица 'test_user_mapping': {diagnostics.testUserMappingTableExists === true ? 'Существует' : diagnostics.testUserMappingTableExists === false ? 'Отсутствует' : 'Проверка...'}</span>
        </li>
      </ul>
      {diagnostics.error && (
        <p className="text-red-500 mt-3">Ошибка диагностики: {diagnostics.error}</p>
      )}
      <button
        onClick={runDiagnostics}
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2"
        disabled={isLoading}
      >
        <RefreshCcw size={16} /> Обновить диагностику
      </button>
    </div>
  )
}

export default SupabaseDiagnostics