import React, { useState } from 'react'
import { X, CreditCard, Shield } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  amount: number
  description: string
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  description
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Здесь будет интеграция с Тинькофф СБП
      // Пока что симуляция успешной оплаты
      console.log('Инициируем оплату через Тинькофф СБП:', {
        amount,
        description
      })

      // Симуляция задержки оплаты
      await new Promise(resolve => setTimeout(resolve, 2000))

      // В реальной реализации здесь будет:
      // 1. Создание платежа через API Тинькофф
      // 2. Получение ссылки на оплату
      // 3. Перенаправление пользователя на оплату
      // 4. Обработка callback'а об успешной оплате

      onPaymentSuccess()
      onClose()
    } catch (err) {
      console.error('Ошибка при обработке платежа:', err)
      setError('Произошла ошибка при обработке платежа. Попробуйте еще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Оплата через СБП</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="payment-modal-content">
          <div className="payment-info">
            <div className="payment-icon">
              <CreditCard size={32} />
            </div>
            <h3>Доступ к результатам теста</h3>
            <p className="payment-description">{description}</p>
            <div className="payment-amount">
              <span className="amount-label">Сумма к оплате:</span>
              <span className="amount-value">{amount} ₽</span>
            </div>
          </div>

          <div className="payment-security">
            <Shield size={16} />
            <span>Безопасная оплата через Тинькофф Банк</span>
          </div>

          {error && (
            <div className="payment-error">
              {error}
            </div>
          )}

          <div className="payment-actions">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="payment-button"
            >
              {isProcessing ? 'Обработка...' : `Оплатить ${amount} ₽`}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="cancel-button"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
