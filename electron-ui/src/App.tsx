import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SchoolPage from './pages/SchoolPage'
import MajorPage from './pages/MajorPage'
import ClassPage from './pages/ClassPage'
import StudentPage from './pages/StudentPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />}>
          <Route index element={<Navigate to="/schools" replace />} />
          <Route path="schools" element={<SchoolPage />} />
          <Route path="majors" element={<MajorPage />} />
          <Route path="classes" element={<ClassPage />} />
          <Route path="students" element={<StudentPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
