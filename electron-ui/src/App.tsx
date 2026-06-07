import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ClassPage from './pages/ClassPage'
import StudentPage from './pages/StudentPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />}>
          {/* 默认重定向到班级管理 */}
          <Route index element={<Navigate to="/classes" replace />} />
          <Route path="classes" element={<ClassPage />} />
          <Route path="students" element={<StudentPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
