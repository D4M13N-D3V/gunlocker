import { Link } from 'react-router-dom'
import { useInventoryStats } from '../../hooks/useInventory'
import Card, { CardBody, CardHeader } from '../common/Card'

export default function TotalInventory() {
  const { data: stats, isLoading } = useInventoryStats()

  if (isLoading) {
    return (
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900 dark:text-white">Inventory Value</h2></CardHeader>
        <CardBody className="animate-pulse"><div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div></CardBody>
      </Card>
    )
  }

  const categories = [
    { label: 'Firearms', value: stats?.valueByCategory?.firearms || 0, color: 'bg-blue-500' },
    { label: 'Optics', value: stats?.valueByCategory?.optics || 0, color: 'bg-purple-500' },
    { label: 'Accessories', value: stats?.valueByCategory?.accessories || 0, color: 'bg-pink-500' },
    { label: 'Gear', value: stats?.valueByCategory?.gear || 0, color: 'bg-green-500' },
    { label: 'Ammunition', value: stats?.valueByCategory?.ammunition || 0, color: 'bg-amber-500' },
  ]

  const total = stats?.totalValue || 0

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">Inventory Value</h2>
        <Link to="/inventory" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
      </CardHeader>
      <CardBody>
        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${total.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total inventory value</p>
        </div>

        {/* Bar chart */}
        <div className="h-4 flex rounded-full overflow-hidden mb-4">
          {categories.map((cat) => {
            const width = total > 0 ? (cat.value / total) * 100 : 0
            return width > 0 ? (
              <div key={cat.label} className={`${cat.color}`} style={{ width: `${width}%` }} title={`${cat.label}: $${cat.value.toLocaleString()}`} />
            ) : null
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
              <div>
                <p className="text-xs text-gray-500">{cat.label}</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">${cat.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
