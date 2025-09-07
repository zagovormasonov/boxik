import { Routes, Route } from 'react-router-dom'
import TestScreen from './components/TestScreen/TestScreen'
import AuthScreen from './components/AuthScreen/AuthScreen'
import AuthCallback from './components/AuthCallback/AuthCallback'
import YandexCallback from './components/YandexCallback/YandexCallback'
import { TestProvider } from './contexts/TestContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <TestProvider>
      <AuthProvider>
        <div className="container">
          <Routes>
            <Route path="/" element={<TestScreen />} />
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/yandex/callback" element={<YandexCallback />} />
          </Routes>
        </div>
      </AuthProvider>
    </TestProvider>
  )
}

export default App
