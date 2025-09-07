import React, { useState } from 'react'
import { CheckCircle, Send, Download } from 'lucide-react'
import { BPDCategory } from '../../types'
import { usePDFGenerator } from '../../shared/hooks/usePDFGenerator'
import { BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'

interface BPDTestResultCardProps {
  testResult: BPDTestResultWithDetails
  onSendToSpecialist: (result: BPDTestResultWithDetails) => Promise<boolean>
  isSending: boolean
}

const BPDTestResultCard: React.FC<BPDTestResultCardProps> = ({
  testResult,
  onSendToSpecialist,
  isSending
}) => {
  const [isSent, setIsSent] = useState(false)
  const { generateTestResultPDF, isGenerating } = usePDFGenerator()

  const handleSendToSpecialist = async () => {
    const success = await onSendToSpecialist(testResult)
    if (success) {
      setIsSent(true)
    }
  }

  const handleDownloadPDF = async () => {
    // Для БПД теста создаем упрощенную версию PDF
    const success = await generateBPDTestResultPDF(testResult)
    if (!success) {
      alert('Ошибка при генерации PDF')
    }
  }

  const generateBPDTestResultPDF = async (testResult: BPDTestResultWithDetails): Promise<boolean> => {
    try {
      // Создаем упрощенную версию PDF для БПД теста
      const mockQuestions: any[] = [] // БПД тест не требует детальных вопросов в PDF
      const mockAnswers = testResult.answers
      
      // Создаем объект совместимый с существующим генератором
      const mockTestResult = {
        id: testResult.id,
        user_id: testResult.userId,
        score: testResult.totalScore,
        total_questions: 18,
        percentage: testResult.percentage,
        grade: getSeverityText(testResult.severity),
        completed_date: testResult.completed_date,
        answers: testResult.answers,
        completed_at: testResult.completedAt
      }

      return await generateTestResultPDF(mockTestResult, mockQuestions, mockAnswers)
    } catch (error) {
      console.error('Ошибка при генерации PDF БПД теста:', error)
      return false
    }
  }

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

  const getCategoryText = (category: BPDCategory): string => {
    switch (category) {
      case BPDCategory.FEAR_OF_ABANDONMENT:
        return 'Страх покинутости'
      case BPDCategory.UNSTABLE_RELATIONSHIPS:
        return 'Нестабильные отношения'
      case BPDCategory.IDENTITY_DISTURBANCE:
        return 'Нарушение идентичности'
      case BPDCategory.IMPULSIVITY:
        return 'Импульсивность'
      case BPDCategory.SUICIDAL_BEHAVIOR:
        return 'Суицидальное поведение'
      case BPDCategory.AFFECTIVE_INSTABILITY:
        return 'Аффективная нестабильность'
      case BPDCategory.EMPTINESS:
        return 'Чувство пустоты'
      case BPDCategory.ANGER:
        return 'Приступы гнева'
      case BPDCategory.PARANOID_IDEATION:
        return 'Параноидные идеи'
      default:
        return 'Неизвестная категория'
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'none':
        return '#10b981' // зеленый
      case 'mild':
        return '#f59e0b' // желтый
      case 'moderate':
        return '#f97316' // оранжевый
      case 'severe':
        return '#ef4444' // красный
      default:
        return '#6b7280' // серый
    }
  }

  return (
    <div className="test-result-card">
      <div className="test-result-header">
        <h3>Результаты теста БПД</h3>
        <span className="test-date">
          {new Date(testResult.completedAt).toLocaleDateString('ru-RU')}
        </span>
      </div>

      <div className="score-section">
        <div className="score-item">
          <span className="score-label">Общий балл:</span>
          <span className="score-value">{testResult.totalScore} из 72</span>
        </div>
        <div className="score-item">
          <span className="score-label">Процент:</span>
          <span className="score-value">{testResult.percentage}%</span>
        </div>
        <div className="score-item">
          <span className="score-label">Уровень выраженности:</span>
          <span 
            className="score-value" 
            style={{ color: getSeverityColor(testResult.severity) }}
          >
            {getSeverityText(testResult.severity)}
          </span>
        </div>
      </div>

      <div className="category-scores">
        <h4>Баллы по категориям:</h4>
        <div className="category-grid">
          {Object.entries(testResult.categoryScores).map(([category, score]) => (
            <div key={category} className="category-item">
              <span className="category-name">{getCategoryText(category as BPDCategory)}</span>
              <span className="category-score">{String(score)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="test-result-actions">
        {isSent ? (
          <div className="sent-indicator">
            <CheckCircle size={20} />
            <span>Отправлено специалисту</span>
          </div>
        ) : (
          <button
            onClick={handleSendToSpecialist}
            disabled={isSending}
            className="send-button"
          >
            <Send size={20} />
            {isSending ? 'Отправка...' : 'Отправить специалисту'}
          </button>
        )}

        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="download-pdf-button"
        >
          <Download size={20} />
          {isGenerating ? 'Генерация PDF...' : 'Скачать PDF'}
        </button>
      </div>
    </div>
  )
}

export default BPDTestResultCard
