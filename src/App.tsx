import { Routes, Route } from 'react-router-dom'
import BPDTestScreen from './components/BPDTestScreen/BPDTestScreen'
import AuthScreen from './components/AuthScreen/AuthScreen'
import AuthCallback from './components/AuthCallback/AuthCallback'
import YandexCallback from './components/YandexCallback/YandexCallback'
import { BPDTestProvider } from './contexts/BPDTestContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <BPDTestProvider>
      <AuthProvider>
        <div className="container">
          <Routes>
            <Route path="/" element={<BPDTestScreen />} />
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/yandex/callback" element={<YandexCallback />} />
          </Routes>
        </div>
      </AuthProvider>
    </BPDTestProvider>
  )
}

export default App
