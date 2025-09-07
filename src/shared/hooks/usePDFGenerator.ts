import { useState } from 'react'
import html2canvas from 'html2canvas'
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
      console.log('PDF Generator: Начинаем генерацию PDF через HTML')
      
      // Создаем временный HTML элемент
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '800px'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.padding = '40px'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '14px'
      tempDiv.style.lineHeight = '1.6'
      tempDiv.style.color = '#333'
      
      // Генерируем HTML контент
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0; color: #2563eb;">Результаты психологического теста</h1>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="font-size: 14px; margin: 5px 0;"><strong>Дата прохождения:</strong> ${testResult.completed_date}</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="font-size: 18px; margin: 0 0 15px 0; color: #1e40af;">Общий результат</h2>
          <p style="margin: 5px 0;"><strong>Баллы:</strong> ${testResult.score} из ${testResult.total_questions}</p>
          <p style="margin: 5px 0;"><strong>Процент:</strong> ${testResult.percentage}%</p>
          <p style="margin: 5px 0;"><strong>Оценка:</strong> ${testResult.grade}</p>
        </div>
        
        <div>
          <h2 style="font-size: 18px; margin: 0 0 20px 0; color: #1e40af;">Детальные результаты</h2>
          ${questions.map((question, index) => `
            <div style="margin-bottom: 25px; page-break-inside: avoid;">
              <h3 style="font-size: 16px; margin: 0 0 10px 0; color: #374151;">${index + 1}. ${question.text}</h3>
              <div style="margin-left: 20px;">
                ${question.options.map((option, optionIndex) => {
                  const isUserAnswer = userAnswers[index] === optionIndex
                  const isCorrectAnswer = question.correctAnswer === optionIndex
                  
                  let prefix = ''
                  let style = 'margin: 3px 0; padding: 5px;'
                  
                  if (isUserAnswer && isCorrectAnswer) {
                    prefix = '✓ '
                    style += 'background-color: #dcfce7; color: #166534;'
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    prefix = '✗ '
                    style += 'background-color: #fef2f2; color: #dc2626;'
                  } else if (!isUserAnswer && isCorrectAnswer) {
                    prefix = '→ '
                    style += 'background-color: #f0f9ff; color: #0369a1;'
                  } else {
                    style += 'background-color: #f9fafb;'
                  }
                  
                  return `<p style="${style}">${prefix}${option}</p>`
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          <p style="margin: 5px 0;">Этот документ содержит результаты психологического теста.</p>
          <p style="margin: 5px 0;">Для получения профессиональной консультации обратитесь к специалисту.</p>
        </div>
      `
      
      // Добавляем элемент в DOM
      document.body.appendChild(tempDiv)
      
      // Конвертируем HTML в canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Удаляем временный элемент
      document.body.removeChild(tempDiv)
      
      // Создаем PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
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
