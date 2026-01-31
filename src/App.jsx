import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import logger from './lib/logger'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import FirearmsPage from './pages/FirearmsPage'
import AmmunitionPage from './pages/AmmunitionPage'
import GearPage from './pages/GearPage'
import OpticsPage from './pages/OpticsPage'
import AccessoriesPage from './pages/AccessoriesPage'
import MaintenancePage from './pages/MaintenancePage'
import RangeTripsPage from './pages/RangeTripsPage'
import InventoryPage from './pages/InventoryPage'

// Navigation logger component
function NavigationLogger() {
  const location = useLocation()

  useEffect(() => {
    logger.nav('', location.pathname)
  }, [location])

  return null
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  logger.info('App', 'App component rendered')

  return (
    <>
      <NavigationLogger />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/firearms/*" element={<FirearmsPage />} />
                <Route path="/ammunition" element={<AmmunitionPage />} />
                <Route path="/gear" element={<GearPage />} />
                <Route path="/optics" element={<OpticsPage />} />
                <Route path="/accessories" element={<AccessoriesPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/range-trips/*" element={<RangeTripsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  )
}

export default App
