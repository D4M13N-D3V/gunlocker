import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useWarrantyAlerts } from '../../hooks/useInventory'
import Card, { CardBody, CardHeader } from '../common/Card'

const STATUS_COLORS = {
  expired: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function WarrantyAlerts() {
  const { data: alerts, isLoading } = useWarrantyAlerts()

  if (isLoading) {
    return (
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900 dark:text-white">Warranty Alerts</h2></CardHeader>
        <CardBody className="animate-pulse"><div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>)}</div></CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-gray-900 dark:text-white">Warranty Alerts</h2>
      </CardHeader>
      <CardBody>
        {alerts?.length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={`${alert.category}-${alert.id}`} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alert.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{alert.category}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[alert.status]}`}>
                  {alert.status === 'expired' ? 'Expired' : `${alert.daysRemaining}d`}
                </span>
              </div>
            ))}
            {alerts.length > 5 && (
              <Link to="/inventory" className="block text-center text-sm text-primary-600 hover:text-primary-700 pt-2">
                View all {alerts.length} alerts
              </Link>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No warranty alerts</p>
        )}
      </CardBody>
    </Card>
  )
}
