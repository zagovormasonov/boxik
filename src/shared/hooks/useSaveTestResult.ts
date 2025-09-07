import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TestState } from '../../types'

export interface SaveTestResultParams {
  userId: string
  testState: TestState
  totalQuestions: number
}

export function useSaveTestResult() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveTestResult = async ({ userId, testState, totalQuestions }: SaveTestResultParams) => {
    setIsSaving(true)
    setError(null)

    try {
      const testResultData = {
        user_id: userId,
        score: testState.score,
        total_questions: totalQuestions,
        answers: testState.answers,
        completed_at: new Date().toISOString()
      }

      console.log('useSaveTestResult: Сохранение результата теста:', testResultData)
      console.log('useSaveTestResult: userId:', userId)

      const { data, error: insertError } = await supabase
        .from('test_results')
        .insert([testResultData])
        .select()
        .single()

      console.log('useSaveTestResult: Ответ от Supabase:', { data, insertError })
      console.log('useSaveTestResult: Статус ошибки:', insertError?.code, insertError?.message)

      if (insertError) {
        console.error('useSaveTestResult: Ошибка при сохранении результата теста:', insertError)
        throw insertError
      }

      console.log('useSaveTestResult: Результат теста успешно сохранен:', data)
      return data
    } catch (err) {
      console.error('Ошибка при сохранении результата теста:', err)
      setError('Не удалось сохранить результат теста')
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveTestResult,
    isSaving,
    error
  }
}
