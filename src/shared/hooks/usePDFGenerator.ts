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
      
      // Создаем временный HTML элемент с улучшенными стилями для разбивки страниц
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
      tempDiv.style.pageBreakInside = 'avoid'
      
      // Функция для получения текста категории БПД
      const getCategoryText = (category: string): string => {
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
      
      // Генерируем HTML контент с улучшенной разбивкой страниц
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; page-break-inside: avoid;">
          <h1 style="font-size: 22px; margin: 0; color: #374151; font-weight: 600;">Результаты психологического теста</h1>
        </div>
        
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <p style="font-size: 14px; margin: 5px 0; color: #6b7280;"><strong>Дата прохождения:</strong> ${new Date(testResult.completed_date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="font-size: 16px; margin: 0 0 15px 0; color: #374151; font-weight: 600;">Общий результат</h2>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Баллы:</strong> ${testResult.score} из ${testResult.total_questions}</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Процент:</strong> ${testResult.percentage}%</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Оценка:</strong> ${testResult.grade}</p>
        </div>
        
        <div>
          <h2 style="font-size: 16px; margin: 0 0 20px 0; color: #374151; font-weight: 600; page-break-inside: avoid;">Детальные результаты</h2>
          ${questions.length > 0 ? questions.map((question, index) => `
            <div style="margin-bottom: 30px; page-break-inside: avoid; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0;">
              <h3 style="font-size: 14px; margin: 0 0 12px 0; color: #374151; font-weight: 500; line-height: 1.4;">${index + 1}. ${question.text}</h3>
              <div style="margin-left: 20px;">
                ${question.options.map((option, optionIndex) => {
                  const isUserAnswer = userAnswers[index] === optionIndex
                  
                  let prefix = ''
                  let style = 'margin: 4px 0; padding: 10px 12px; border-radius: 6px; font-size: 13px;'
                  
                  if (isUserAnswer) {
                    prefix = '✓ '
                    style += 'background-color: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; font-weight: 500;'
                  } else {
                    style += 'background-color: #ffffff; color: #6b7280; border: 1px solid #e5e7eb;'
                  }
                  
                  return `<p style="${style}">${prefix}${option}</p>`
                }).join('')}
              </div>
            </div>
          `).join('') : `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <h3 style="font-size: 14px; margin: 0 0 15px 0; color: #374151; font-weight: 500;">Результаты по категориям симптомов БПД:</h3>
              <div style="margin-left: 20px;">
                ${Object.entries((testResult as any).categoryScores || {}).map(([category, score]) => {
                  const categoryText = getCategoryText(category)
                  return `<p style="margin: 8px 0; padding: 10px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 13px;">
                    <strong>${categoryText}:</strong> ${score} баллов
                  </p>`
                }).join('')}
              </div>
            </div>
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <h3 style="font-size: 14px; margin: 0 0 15px 0; color: #374151; font-weight: 500;">Детальные ответы по вопросам:</h3>
              <div style="margin-left: 20px;">
                ${userAnswers.map((answer, index) => {
                  const answerText = answer >= 0 ? ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'][answer] : 'Не отвечено'
                  const questionText = questions.length > index ? questions[index].text : `Вопрос ${index + 1}`
                  return `<p style="margin: 8px 0; padding: 10px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 13px; line-height: 1.4;">
                    <strong>${questionText}:</strong><br/>
                    <span style="color: #4b5563; margin-left: 10px;">${answerText}</span>
                  </p>`
                }).join('')}
              </div>
            </div>
          `}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; page-break-inside: avoid;">
          <p style="margin: 5px 0;">Этот документ содержит результаты психологического теста.</p>
          <p style="margin: 5px 0;">Для получения профессиональной консультации обратитесь к специалисту.</p>
        </div>
      `
      
      // Добавляем элемент в DOM
      document.body.appendChild(tempDiv)
      
      // Конвертируем HTML в canvas с улучшенными настройками
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: tempDiv.scrollHeight,
        width: tempDiv.scrollWidth
      })
      
      // Удаляем временный элемент
      document.body.removeChild(tempDiv)
      
      // Создаем PDF с улучшенной разбивкой страниц
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Добавляем отступы для лучшей читаемости
      const marginTop = 15
      const marginBottom = 15
      const availableHeight = pageHeight - marginTop - marginBottom
      
      let heightLeft = imgHeight
      let position = -marginTop
      
      // Добавляем первую страницу
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= availableHeight
      
      // Добавляем дополнительные страницы с правильными отступами
      while (heightLeft > 0) {
        position = -marginTop - (imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= availableHeight
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
