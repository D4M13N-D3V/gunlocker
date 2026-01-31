import { Link } from 'react-router-dom'
import QuickStats from './QuickStats'
import TotalInventory from './TotalInventory'
import WarrantyAlerts from './WarrantyAlerts'
import RecentActivity from './RecentActivity'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link to="/firearms" className="btn-primary">Add Firearm</Link>
        </div>
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TotalInventory />
          <RecentActivity />
        </div>
        <div className="space-y-6">
          <WarrantyAlerts />
        </div>
      </div>
    </div>
  )
}
