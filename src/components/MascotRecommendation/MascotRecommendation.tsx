import React, { useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'
import { useChatGPTRecommendation } from '../../shared/hooks/useChatGPTRecommendation'

interface MascotRecommendationProps {
  testResult: BPDTestResultWithDetails
}

const MascotRecommendation: React.FC<MascotRecommendationProps> = ({ testResult }) => {
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
    <div className="mascot-recommendation-container">
      <div className="mascot-button-container">
        <button
          onClick={handleGenerateRecommendation}
          disabled={isLoading}
          className="mascot-button"
          title="Получить рекомендацию от маскота"
        >
          <img src="/mascot.png" alt="Маскот" className="mascot-button-image" />
          <span className="mascot-button-text">
            {isLoading ? 'Генерирую...' : hasGenerated ? 'Обновить рекомендацию' : 'Получить рекомендацию'}
          </span>
        </button>
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
          <span>Анализирую результаты теста...</span>
        </div>
      )}

      {recommendation && (
        <div className="recommendation-content">
          <div className="recommendation-header">
            <h3>Рекомендация от маскота</h3>
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="regenerate-button"
            >
              <RefreshCw size={14} />
              Обновить
            </button>
          </div>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  )
}

export default MascotRecommendation
