import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ReportBug from './pages/ReportBug'
import SearchBugs from './pages/SearchBugs'
import ViewBug from './pages/ViewBug'
import EditBug from './pages/EditBug'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><ReportBug /></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><SearchBugs /></PrivateRoute>} />
          <Route path="/bug/:id" element={<PrivateRoute><ViewBug /></PrivateRoute>} />
          <Route path="/bug/:id/edit" element={<PrivateRoute><EditBug /></PrivateRoute>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
