import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import type { ReactNode } from 'react'

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}
