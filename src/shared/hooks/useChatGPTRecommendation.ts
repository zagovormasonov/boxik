import { useState } from 'react'
import { BPDTestResultWithDetails } from './useBPDTestResults'

export function useChatGPTRecommendation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendation = async (testResult: BPDTestResultWithDetails): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('ChatGPT: Начинаем генерацию рекомендации для результата:', testResult)

      // Формируем промпт для ChatGPT
      const prompt = createRecommendationPrompt(testResult)
      
      console.log('ChatGPT: Отправляем запрос с промптом:', prompt)

      // Реальный API вызов к ChatGPT
      const recommendation = await callChatGPTAPI(prompt)
      
      console.log('ChatGPT: Получена рекомендация:', recommendation)
      return recommendation

    } catch (err) {
      console.error('ChatGPT: Ошибка при генерации рекомендации:', err)
      setError(err instanceof Error ? err.message : 'Ошибка генерации рекомендации')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateRecommendation,
    isLoading,
    error
  }
}

// Функция для создания промпта для ChatGPT
const createRecommendationPrompt = (testResult: BPDTestResultWithDetails): string => {
  const severityText = getSeverityText(testResult.severity)
  const categoryScores = testResult.categoryScores || {}
  
  // Формируем информацию о баллах по категориям
  const categoryInfo = Object.entries(categoryScores).map(([category, score]) => {
    const categoryName = getCategoryName(category)
    return `${categoryName}: ${score} баллов`
  }).join(', ')

  return `Ты профессиональный психолог. На основе результатов теста на пограничное расстройство личности (БПД) дай краткую рекомендацию на русском языке.

Результаты теста:
- Общий балл: ${testResult.totalScore} из 72
- Процент: ${testResult.percentage}%
- Уровень выраженности: ${severityText}
- Баллы по категориям: ${categoryInfo}

Требования к рекомендации:
1. Максимум 3-4 предложения
2. Человеческим языком, без медицинских терминов
3. Конструктивные советы
4. Подчеркни важность обращения к специалисту
5. Будь тактичным и поддерживающим

Рекомендация:`
}

// Функция для получения текста уровня выраженности
const getSeverityText = (severity: string): string => {
  switch (severity) {
    case 'none':
      return 'Отсутствие симптомов'
    case 'mild':
      return 'Легкая выраженность'
    case 'moderate':
      return 'Умеренная выраженность'
    case 'severe':
      return 'Тяжелая выраженность'
    default:
      return 'Не определено'
  }
}

// Функция для получения названия категории
const getCategoryName = (category: string): string => {
  switch (category) {
    case 'fear_of_abandonment':
      return 'Страх покинутости'
    case 'unstable_relationships':
      return 'Нестабильные отношения'
    case 'identity_disturbance':
      return 'Нарушение идентичности'
    case 'impulsivity':
      return 'Импульсивность'
    case 'suicidal_behavior':
      return 'Суицидальное поведение'
    case 'affective_instability':
      return 'Аффективная нестабильность'
    case 'emptiness':
      return 'Чувство пустоты'
    case 'anger':
      return 'Приступы гнева'
    case 'paranoid_ideation':
      return 'Параноидные идеи'
    default:
      return 'Неизвестная категория'
  }
}

// Реальная функция для вызова ChatGPT API
const callChatGPTAPI = async (prompt: string): Promise<string> => {
  const API_KEY = process.env.REACT_APP_CHATGPT_API_KEY
  
  if (!API_KEY) {
    throw new Error('API ключ ChatGPT не настроен. Добавьте REACT_APP_CHATGPT_API_KEY в переменные окружения.')
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный психолог, специализирующийся на пограничном расстройстве личности. Отвечай на русском языке, будь тактичным и поддерживающим. Давай краткие рекомендации (3-4 предложения).'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`ChatGPT API error: ${response.status} - ${errorData.error?.message || 'Неизвестная ошибка'}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// Заглушка для тестирования (закомментирована)
/*
const mockChatGPTCall = async (prompt: string): Promise<string> => {
  // Имитируем задержку API
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Возвращаем примерную рекомендацию на основе промпта
  if (prompt.includes('Тяжелая выраженность')) {
    return 'Результаты показывают высокий уровень симптомов БПД. Рекомендуется немедленно обратиться к психологу или психиатру для получения профессиональной помощи. Важно не оставаться с этим один на один.'
  } else if (prompt.includes('Умеренная выраженность')) {
    return 'Обнаружены умеренные признаки БПД. Стоит рассмотреть возможность работы с психологом для развития навыков эмоциональной регуляции. Также полезны техники осознанности и стабильный режим дня.'
  } else if (prompt.includes('Легкая выраженность')) {
    return 'Результаты указывают на легкие проявления симптомов БПД. Рекомендуется профилактическая работа с психологом и развитие навыков саморегуляции. Полезны техники релаксации и работа с эмоциями.'
  } else {
    return 'Результаты показывают низкий уровень симптомов БПД. Продолжайте заботиться о своем психическом здоровье, практикуйте техники релаксации и при необходимости обращайтесь к специалистам.'
  }
}
*/
