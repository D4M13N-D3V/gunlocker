import { useInventoryStats } from '../../hooks/useInventory'
import Card, { CardBody } from '../common/Card'

export default function QuickStats() {
  const { data: stats, isLoading } = useInventoryStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardBody className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    { label: 'Firearms', value: stats?.totalFirearms || 0, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Rounds', value: stats?.totalAmmunition?.toLocaleString() || 0, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Gear & Accessories', value: (stats?.totalGear || 0) + (stats?.totalAccessories || 0), color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Total Value', value: `$${(stats?.totalValue || 0).toLocaleString()}`, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <span className={`text-lg font-bold ${stat.color}`}>#</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
