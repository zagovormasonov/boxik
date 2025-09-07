import { useState } from 'react'
import jsPDF from 'jspdf'
import { TestResultWithDetails } from './useTestResults'
import { Question } from '../../types'

export interface TestResultPDFData extends TestResultWithDetails {
  questions: Question[]
  userAnswers: { questionId: number; answer: number; isCorrect: boolean }[]
}

export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateTestResultPDF = async (testResult: TestResultWithDetails, questions: Question[], userAnswers: number[]) => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log('PDF Generator: Начинаем генерацию PDF')
      
      // Создаем новый PDF документ
      const pdf = new jsPDF()
      
      // Настройки
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      // Функция для добавления новой страницы если нужно
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }
      }

      // Функция для добавления текста с поддержкой кириллицы
      const addText = (text: string, x: number, y: number, options?: any) => {
        // Используем встроенную поддержку UTF-8 в jsPDF 2.x
        try {
          pdf.text(text, x, y, options)
        } catch (error) {
          console.warn('Ошибка при добавлении текста:', error)
          // Если не получается, разбиваем на строки
          const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin)
          if (Array.isArray(lines)) {
            lines.forEach((line: string, index: number) => {
              pdf.text(line, x, y + (index * 5), options)
            })
          } else {
            pdf.text(lines, x, y, options)
          }
        }
      }

      // Заголовок
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      addText('Результаты психологического теста', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      // Информация о пользователе и дате
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      addText(`Дата прохождения: ${testResult.completed_date}`, margin, yPosition)
      yPosition += 15

      // Общий результат
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      addText('Общий результат:', margin, yPosition)
      yPosition += 10

      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'normal')
      addText(`Баллы: ${testResult.score} из ${testResult.total_questions}`, margin, yPosition)
      yPosition += 8
      addText(`Процент: ${testResult.percentage}%`, margin, yPosition)
      yPosition += 8
      addText(`Оценка: ${testResult.grade}`, margin, yPosition)
      yPosition += 20

      // Детальные результаты по вопросам
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      addText('Детальные результаты:', margin, yPosition)
      yPosition += 15

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')

      questions.forEach((question, index) => {
        checkNewPage(40)
        
        // Номер вопроса
        pdf.setFont('helvetica', 'bold')
        addText(`${index + 1}. ${question.text}`, margin, yPosition)
        yPosition += 8

        // Варианты ответов
        pdf.setFont('helvetica', 'normal')
        question.options.forEach((option, optionIndex) => {
          const isUserAnswer = userAnswers[index] === optionIndex
          const isCorrectAnswer = question.correctAnswer === optionIndex
          
          let prefix = '  '
          if (isUserAnswer && isCorrectAnswer) {
            prefix = '✓ ' // Правильный ответ пользователя
          } else if (isUserAnswer && !isCorrectAnswer) {
            prefix = '✗ ' // Неправильный ответ пользователя
          } else if (!isUserAnswer && isCorrectAnswer) {
            prefix = '→ ' // Правильный ответ (не выбранный пользователем)
          }

          addText(`${prefix}${option}`, margin + 10, yPosition)
          yPosition += 6
        })

        yPosition += 8
      })

      // Добавляем информацию о тесте в конец
      checkNewPage(30)
      yPosition += 10
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'italic')
      addText('Этот документ содержит результаты психологического теста.', margin, yPosition)
      yPosition += 6
      addText('Для получения профессиональной консультации обратитесь к специалисту.', margin, yPosition)

      // Генерируем имя файла
      const fileName = `test_results_${new Date().toISOString().split('T')[0]}.pdf`

      // Скачиваем PDF
      pdf.save(fileName)
      
      console.log('PDF Generator: PDF успешно сгенерирован и скачан')
      return true
    } catch (err) {
      console.error('PDF Generator: Ошибка при генерации PDF:', err)
      setError('Не удалось сгенерировать PDF')
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateTestResultPDF,
    isGenerating,
    error
  }
}
