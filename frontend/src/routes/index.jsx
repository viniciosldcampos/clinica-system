import { createBrowserRouter, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Doctors from '../pages/Doctors'
import Patients from '../pages/Patients'
import Appointments from '../pages/Appointments'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
        <Doctors />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
        <Patients />
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT']}>
        <Appointments />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router