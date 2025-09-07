import React, { useState } from 'react'
import { MessageCircle, RefreshCw, AlertCircle, X } from 'lucide-react'
import { BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'
import { useChatGPTRecommendation } from '../../shared/hooks/useChatGPTRecommendation'

interface MascotRecommendationProps {
  testResult: BPDTestResultWithDetails
}

const MascotRecommendation: React.FC<MascotRecommendationProps> = ({ testResult }) => {
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
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

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return (
      <div className="mascot-button-container">
        <button
          onClick={() => setIsVisible(true)}
          className="mascot-button"
          title="Получить рекомендацию от маскота"
        >
          <img src="/mascot.png" alt="Маскот" className="mascot-button-image" />
          <span className="mascot-button-text">Получить рекомендацию</span>
        </button>
      </div>
    )
  }

  return (
    <div className="mascot-recommendation-modal">
      <div className="mascot-modal-overlay" onClick={handleClose}></div>
      
      <div className="mascot-recommendation-container">
        <div className="mascot-speech-bubble">
          <button
            onClick={handleClose}
            className="close-button"
            title="Закрыть"
          >
            <X size={16} />
          </button>

          <div className="speech-bubble-content">
            {error && (
              <div className="recommendation-error">
                <AlertCircle size={16} />
                <span>Ошибка: {error}</span>
              </div>
            )}

            {isLoading && (
              <div className="recommendation-loading">
                <div className="loading-spinner"></div>
                <span>Генерирую рекомендацию...</span>
              </div>
            )}

            {recommendation && (
              <div className="recommendation-content">
                <p>{recommendation}</p>
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="regenerate-button"
                >
                  <RefreshCw size={14} />
                  Обновить
                </button>
              </div>
            )}

            {!hasGenerated && !isLoading && !error && (
              <div className="recommendation-prompt">
                <p>Привет! Я могу дать тебе персональную рекомендацию на основе результатов твоего теста.</p>
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

          <div className="speech-bubble-tail"></div>
        </div>

        <div className="mascot-character">
          <img src="/mascot.png" alt="Маскот-советчик" className="mascot-image" />
        </div>
      </div>
    </div>
  )
}

export default MascotRecommendation
