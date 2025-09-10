import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BPDTestState, BPDTestResult, BPDSeverity } from '../../types'

interface SaveBPDTestResultParams {
  userId: string
  testState: BPDTestState
  totalQuestions: number
  isAuthenticated?: boolean
}

export function useSaveBPDTestResult() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveBPDTestResult = async ({ userId, testState, totalQuestions, isAuthenticated = false }: SaveBPDTestResultParams): Promise<boolean> => {
    setIsSaving(true)
    setError(null)

    try {
      console.log('useSaveBPDTestResult: Начинаем сохранение результатов БПД теста')
      console.log('useSaveBPDTestResult: Данные для сохранения:', { userId, testState, totalQuestions })
      console.log('useSaveBPDTestResult: ID пользователя для сохранения:', userId, 'тип:', typeof userId)

      // Определяем уровень выраженности БПД
      const severity = calculateSeverity(testState.totalScore)

      // Создаем объект результата БПД теста
      const bpdTestResult: BPDTestResult = {
        userId,
        totalScore: testState.totalScore,
        categoryScores: testState.categoryScores,
        severity,
        completedAt: new Date().toISOString(),
        answers: testState.answers
      }

      console.log('useSaveBPDTestResult: Результат БПД теста:', bpdTestResult)

       // Проверяем, является ли пользователь анонимным (неавторизованным)
       // Анонимный пользователь - это UUID, который НЕ существует в таблице users
       const isAnonymousUser = userId.startsWith('anonymous_') || userId.includes('session_') || !userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isAuthenticated
       
       console.log('useSaveBPDTestResult: Проверка типа пользователя:', {
         userId,
         startsWithAnonymous: userId.startsWith('anonymous_'),
         includesSession: userId.includes('session_'),
         isUUID: userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
         isAuthenticated,
         isAnonymousUser
       })
       
       if (isAnonymousUser) {
         console.log('useSaveBPDTestResult: Обнаружен анонимный пользователь, сохраняем в localStorage')
         
         // Сохраняем результат в localStorage для последующего связывания
         const testResult = {
           user_id: userId,
           test_type: 'bpd',
           total_questions: totalQuestions,
           score: testState.totalScore,
           percentage: Math.round((testState.totalScore / (totalQuestions * 4)) * 100),
           grade: severity,
           answers: testState.answers,
           category_scores: testState.categoryScores,
           completed_at: new Date().toISOString(),
           session_id: localStorage.getItem('session_id') || 'unknown'
         }
         
         console.log('useSaveBPDTestResult: Данные для сохранения в localStorage:', testResult)
         
         // Сохраняем в localStorage
         localStorage.setItem('pending_test_result', JSON.stringify(testResult))
         console.log('useSaveBPDTestResult: Результат сохранен в localStorage для анонимного пользователя')
         
         // Проверяем, что действительно сохранилось
         const savedResult = localStorage.getItem('pending_test_result')
         console.log('useSaveBPDTestResult: Проверяем сохранение:', savedResult ? 'СОХРАНЕНО' : 'НЕ СОХРАНЕНО')
         
         // Возвращаем успех без попытки вставки в БД
         return true
       }

       // Сохраняем в таблицу test_results для авторизованных пользователей
       const { data, error: insertError } = await supabase
         .from('test_results')
         .insert([
           {
             user_id: userId,
             test_type: 'bpd',
             total_questions: totalQuestions,
             score: testState.totalScore,
             percentage: Math.round((testState.totalScore / (totalQuestions * 4)) * 100), // Максимальный балл = количество вопросов * 4
             grade: severity,
             answers: testState.answers,
             category_scores: testState.categoryScores,
             completed_at: new Date().toISOString()
           }
         ])
         .select()

      if (insertError) {
        console.error('useSaveBPDTestResult: Ошибка при вставке в БД:', insertError)
        console.error('useSaveBPDTestResult: Детали ошибки:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
        console.error('useSaveBPDTestResult: Полная ошибка:', JSON.stringify(insertError, null, 2))
        
        // Для ошибок RLS (406, PGRST301), конфликтов (409), нарушений внешних ключей (23503) и неверного UUID (22P02) не выбрасываем исключение, а возвращаем false
        const errorCode = String(insertError.code)
        if (insertError.code === 'PGRST301' || insertError.message?.includes('406') || errorCode === '409' || errorCode === '23503' || errorCode === '22P02') {
          if (errorCode === '409') {
            console.warn('⚠️ useSaveBPDTestResult: Конфликт данных (409) - возможно, результат уже существует для этого пользователя')
          } else if (errorCode === '23503') {
            console.warn('⚠️ useSaveBPDTestResult: Нарушение внешнего ключа (23503) - пользователь не найден в таблице users')
            console.warn('⚠️ useSaveBPDTestResult: Возможно, пользователь был удален или ID изменился')
          } else if (errorCode === '22P02') {
            console.warn('⚠️ useSaveBPDTestResult: Неверный формат UUID (22P02) - user_id не является валидным UUID')
            console.warn('⚠️ useSaveBPDTestResult: Возможно, используется неправильный формат ID пользователя')
          } else {
            console.warn('⚠️ useSaveBPDTestResult: Проблемы с БД (RLS), но продолжаем работу')
          }
          return false
        }
        
        throw insertError
      }

      console.log('useSaveBPDTestResult: Результат успешно сохранен:', data)
      return true
    } catch (err) {
      console.error('useSaveBPDTestResult: Ошибка при сохранении:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveBPDTestResult,
    isSaving,
    error
  }
}

// Функция для определения уровня выраженности БПД
const calculateSeverity = (totalScore: number): BPDSeverity => {
  // Пороговые значения на основе клинических стандартов
  if (totalScore < 20) return BPDSeverity.NONE
  if (totalScore < 40) return BPDSeverity.MILD
  if (totalScore < 60) return BPDSeverity.MODERATE
  return BPDSeverity.SEVERE
}
