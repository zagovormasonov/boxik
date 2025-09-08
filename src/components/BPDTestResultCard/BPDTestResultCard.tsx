import React, { useState, useEffect } from 'react'
import { CheckCircle, Send, Download, Lock } from 'lucide-react'
import { usePDFGenerator } from '../../shared/hooks/usePDFGenerator'
import { BPDTestResultWithDetails } from '../../shared/hooks/useBPDTestResults'
import { bpdQuestions } from '../../contexts/BPDTestContext'
import { usePaymentContext } from '../../contexts/PaymentContext'

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
  const { hasPaid, showPaymentModal, refreshPaymentStatus } = usePaymentContext()

  // Принудительно проверяем статус подписки при загрузке компонента
  useEffect(() => {
    console.log('BPDTestResultCard: Принудительно проверяем статус подписки')
    console.log('BPDTestResultCard: Текущий hasPaid:', hasPaid)
    console.log('BPDTestResultCard: localStorage hasPaid:', localStorage.getItem('hasPaid'))
    refreshPaymentStatus()
  }, [refreshPaymentStatus])

  // Логируем изменения hasPaid
  useEffect(() => {
    console.log('BPDTestResultCard: hasPaid изменился на:', hasPaid)
  }, [hasPaid])

  const handlePayment = () => {
    if (!hasPaid) {
      showPaymentModal()
    }
  }

  const generateBPDTestResultPDF = async (testResult: BPDTestResultWithDetails): Promise<boolean> => {
    try {
      // Используем реальные вопросы БПД теста
      const questions = bpdQuestions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswer: -1 // БПД тест не имеет правильных ответов
      }))
      
      const answers = testResult.answers
      
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

      return await generateTestResultPDF(mockTestResult, questions, answers)
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

      <div className="test-result-actions">
        {hasPaid ? (
          <div className="paid-actions">
            {isSent ? (
              <div className="sent-indicator">
                <CheckCircle size={20} />
                <span>Отправлено специалисту</span>
              </div>
            ) : (
              <button
                onClick={async () => {
                  const success = await onSendToSpecialist(testResult)
                  if (success) {
                    setIsSent(true)
                  }
                }}
                disabled={isSending}
                className="send-button"
              >
                <Send size={20} />
                {isSending ? 'Отправка...' : 'Отправить специалисту'}
              </button>
            )}

            <button
              onClick={async () => {
                const success = await generateBPDTestResultPDF(testResult)
                if (!success) {
                  alert('Ошибка при генерации PDF')
                }
              }}
              disabled={isGenerating}
              className="download-pdf-button"
            >
              <Download size={20} />
              {isGenerating ? 'Генерация PDF...' : 'Скачать PDF'}
            </button>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            className="payment-button"
          >
            <Lock size={20} />
            Оплатить для отправки результата и скачивания
          </button>
        )}
      </div>
    </div>
  )
}

export default BPDTestResultCard
