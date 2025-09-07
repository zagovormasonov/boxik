import React, { useState } from 'react'
import { MessageCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'
import { useChatGPTRecommendation } from '../../shared/hooks/useChatGPTRecommendation'

interface ChatGPTRecommendationCardProps {
  testResult: BPDTestResultWithDetails
}

const ChatGPTRecommendationCard: React.FC<ChatGPTRecommendationCardProps> = ({ testResult }) => {
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const { generateRecommendation, isLoading, error } = useChatGPTRecommendation()

  const handleGenerateRecommendation = async () => {
    const result = await generateRecommendation(testResult)
    if (result) {
      setRecommendation(result)
      setHasGenerated(true)
    }
  }

  const handleRegenerate = async () => {
    setRecommendation(null)
    setHasGenerated(false)
    await handleGenerateRecommendation()
  }

  return (
    <div className="chatgpt-recommendation-card">
      <div className="recommendation-header">
        <div className="recommendation-title">
          <MessageCircle size={20} />
          <h3>Рекомендация ИИ</h3>
        </div>
        {hasGenerated && (
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="regenerate-button"
          >
            <RefreshCw size={16} />
            Обновить
          </button>
        )}
      </div>

      {error && (
        <div className="recommendation-error">
          <AlertCircle size={16} />
          <span>Ошибка: {error}</span>
        </div>
      )}

      {isLoading && (
        <div className="recommendation-loading">
          <div className="loading-spinner"></div>
          <span>Генерируем рекомендацию...</span>
        </div>
      )}

      {recommendation && (
        <div className="recommendation-content">
          <p>{recommendation}</p>
        </div>
      )}

      {!hasGenerated && !isLoading && !error && (
        <div className="recommendation-prompt">
          <p>Получите персональную рекомендацию на основе ваших результатов теста</p>
          <button
            onClick={handleGenerateRecommendation}
            disabled={isLoading}
            className="generate-button"
          >
            <MessageCircle size={16} />
            Получить рекомендацию
          </button>
        </div>
      )}
    </div>
  ) 
}

export default ChatGPTRecommendationCard
