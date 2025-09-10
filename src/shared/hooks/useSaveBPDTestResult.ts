import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { BPDTestState, BPDTestResult, BPDSeverity } from '../../types'

interface SaveBPDTestResultParams {
  userId: string
  testState: BPDTestState
  totalQuestions: number
}

export function useSaveBPDTestResult() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveBPDTestResult = async ({ userId, testState, totalQuestions }: SaveBPDTestResultParams): Promise<boolean> => {
    setIsSaving(true)
    setError(null)

    try {
      console.log('useSaveBPDTestResult: Начинаем сохранение результатов БПД теста')
      console.log('useSaveBPDTestResult: Данные для сохранения:', { userId, testState, totalQuestions })

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
        console.error('useSaveBPDTestResult: Ошибка при вставке в БД:', insertError)
        console.error('useSaveBPDTestResult: Детали ошибки:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
        console.error('useSaveBPDTestResult: Полная ошибка:', JSON.stringify(insertError, null, 2))
        
        // Для ошибок RLS (406, PGRST301) и конфликтов (409) не выбрасываем исключение, а возвращаем false
        const errorCode = String(insertError.code)
        if (insertError.code === 'PGRST301' || insertError.message?.includes('406') || errorCode === '409') {
          if (errorCode === '409') {
            console.warn('⚠️ useSaveBPDTestResult: Конфликт данных (409) - возможно, результат уже существует для этого пользователя')
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
