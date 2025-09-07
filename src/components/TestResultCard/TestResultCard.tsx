import React from 'react'
import { Clock, Target, Send, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { TestResultWithDetails } from '../../shared/hooks/useTestResults'
import { usePDFGenerator } from '../../shared/hooks/usePDFGenerator'
import { Question } from '../../types'

interface TestResultCardProps {
  testResult: TestResultWithDetails
  onSendToSpecialist: (result: TestResultWithDetails) => Promise<boolean>
  isSending?: boolean
  questions: Question[]
  userAnswers: number[]
}

const TestResultCard: React.FC<TestResultCardProps> = ({ 
  testResult, 
  onSendToSpecialist, 
  isSending = false,
  questions,
  userAnswers
}) => {
  const [isSent, setIsSent] = React.useState(false)
  const { generateTestResultPDF, isGenerating } = usePDFGenerator()

  const handleSendToSpecialist = async () => {
    const success = await onSendToSpecialist(testResult)
    if (success) {
      setIsSent(true)
    }
  }

  const handleDownloadPDF = async () => {
    const success = await generateTestResultPDF(testResult, questions, userAnswers)
    if (success) {
      console.log('PDF успешно скачан')
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981' // green
    if (percentage >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle size={20} className="text-green-500" />
    if (percentage >= 60) return <AlertCircle size={20} className="text-yellow-500" />
    return <AlertCircle size={20} className="text-red-500" />
  }

  return (
    <div className="test-result-card">
      <div className="test-result-header">
        <h3 className="test-result-title">
          Последний пройденный тест
        </h3>
        <div className="test-result-date">
          <Clock size={16} />
          <span>{testResult.completed_date}</span>
        </div>
      </div>

      <div className="test-result-content">
        <div className="score-section">
          <div className="score-main">
            <div className="score-icon">
              {getScoreIcon(testResult.percentage)}
            </div>
            <div className="score-info">
              <div 
                className="score-value"
                style={{ color: getScoreColor(testResult.percentage) }}
              >
                {testResult.score}/{testResult.total_questions}
              </div>
              <div className="score-percentage">
                {testResult.percentage}%
              </div>
            </div>
          </div>
          
          <div className="grade-section">
            <Target size={18} />
            <span className="grade-text">{testResult.grade}</span>
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
    </div>
  )
}

export default TestResultCard
