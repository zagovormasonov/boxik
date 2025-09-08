import React from 'react'
import { X, CreditCard, Shield } from 'lucide-react'
import { usePayment } from '../../shared/hooks/usePayment'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  description: string
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description
}) => {
  const { createPayment, isProcessing, error } = usePayment()

  const handlePayment = async () => {
    try {
      console.log('Инициируем оплату через Тинькофф СБП:', {
        amount,
        description
      })

      const result = await createPayment({
        amount,
        description
      })

      if (result.success && result.paymentUrl) {
        console.log('Платеж успешно создан, перенаправляем на оплату:', result)
        
        // Перенаправляем пользователя на страницу оплаты Тинькофф
        window.location.href = result.paymentUrl
      } else {
        console.error('Ошибка при создании платежа:', result.error)
      }
    } catch (err) {
      console.error('Ошибка при обработке платежа:', err)
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
