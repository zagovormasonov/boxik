import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { BPDTestState, BPDSeverity } from '../../types'

interface SaveTestFromLocalStorageParams {
  userId: string
  testState: BPDTestState
  totalQuestions: number
}

// Функция для определения уровня выраженности БПД
const calculateSeverity = (totalScore: number): BPDSeverity => {
  if (totalScore < 20) return BPDSeverity.NONE
  if (totalScore < 40) return BPDSeverity.MILD
  if (totalScore < 60) return BPDSeverity.MODERATE
  return BPDSeverity.SEVERE
}

export function useSaveTestFromLocalStorage() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveTestFromLocalStorage = async ({ userId, testState, totalQuestions }: SaveTestFromLocalStorageParams): Promise<boolean> => {
    setIsSaving(true)
    setError(null)

    try {
      console.log('useSaveTestFromLocalStorage: Начинаем сохранение теста из localStorage')
      console.log('useSaveTestFromLocalStorage: Данные для сохранения:', { userId, testState, totalQuestions })

      // Определяем уровень выраженности БПД
      const severity = calculateSeverity(testState.totalScore)

      // Сохраняем в таблицу test_results
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
        console.error('useSaveTestFromLocalStorage: Ошибка при вставке в БД:', insertError)
        
        // Для ошибок RLS (406, PGRST301), конфликтов (409), нарушений внешних ключей (23503) и неверного UUID (22P02) не выбрасываем исключение, а возвращаем false
        const errorCode = String(insertError.code)
        if (insertError.code === 'PGRST301' || insertError.message?.includes('406') || errorCode === '409' || errorCode === '23503' || errorCode === '22P02') {
          if (errorCode === '409') {
            console.warn('⚠️ useSaveTestFromLocalStorage: Конфликт данных (409) - возможно, результат уже существует для этого пользователя')
          } else if (errorCode === '23503') {
            console.warn('⚠️ useSaveTestFromLocalStorage: Нарушение внешнего ключа (23503) - пользователь не найден в таблице users')
          } else if (errorCode === '22P02') {
            console.warn('⚠️ useSaveTestFromLocalStorage: Неверный формат UUID (22P02) - user_id не является валидным UUID')
          } else {
            console.warn('⚠️ useSaveTestFromLocalStorage: Проблемы с БД (RLS), но продолжаем работу')
          }
          return false
        }
        
        throw insertError
      }

      console.log('useSaveTestFromLocalStorage: Результат успешно сохранен:', data)
      
      // Очищаем сохраненное состояние теста из localStorage после успешного сохранения в БД
      try {
        localStorage.removeItem('bpd_test_state')
        console.log('useSaveTestFromLocalStorage: Очищено сохраненное состояние теста из localStorage')
      } catch (error) {
        console.error('useSaveTestFromLocalStorage: Ошибка при очистке localStorage:', error)
      }
      
      return true
    } catch (err) {
      console.error('useSaveTestFromLocalStorage: Ошибка при сохранении:', err)
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveTestFromLocalStorage,
    isSaving,
    error
  }
}
