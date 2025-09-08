import { Routes, Route } from 'react-router-dom'
import BPDTestScreen from './components/BPDTestScreen/BPDTestScreen'
import AuthScreen from './components/AuthScreen/AuthScreen'
import AuthCallback from './components/AuthCallback/AuthCallback'
import YandexCallback from './components/YandexCallback/YandexCallback'
import UserProfile from './components/UserProfile/UserProfile'
import SubscriptionLanding from './components/SubscriptionLanding/SubscriptionLanding'
import PaymentPage from './components/PaymentPage/PaymentPage'
import PaymentCallback from './components/PaymentCallback/PaymentCallback'
import { BPDTestProvider } from './contexts/BPDTestContext'
import { AuthProvider } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'

function App() {
  return (
    <BPDTestProvider>
      <AuthProvider>
        <PaymentProvider>
          <div className="container">
            <Routes>
              <Route path="/" element={<BPDTestScreen />} />
              <Route path="/auth" element={<AuthScreen />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/subscription" element={<SubscriptionLanding />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/yandex/callback" element={<YandexCallback />} />
            </Routes>
          </div>
        </PaymentProvider>
      </AuthProvider>
    </BPDTestProvider>
  )
}

export default App
