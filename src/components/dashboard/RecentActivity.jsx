import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useMaintenance } from '../../hooks/useMaintenance'
import { useRangeTrips } from '../../hooks/useRangeTrips'
import Card, { CardBody, CardHeader } from '../common/Card'

export default function RecentActivity() {
  const { data: maintenance, isLoading: loadingMaintenance } = useMaintenance()
  const { data: rangeTrips, isLoading: loadingTrips } = useRangeTrips()

  const isLoading = loadingMaintenance || loadingTrips

  if (isLoading) {
    return (
      <Card>
        <CardHeader><h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2></CardHeader>
        <CardBody className="animate-pulse"><div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>)}</div></CardBody>
      </Card>
    )
  }

  // Combine and sort activities
  const activities = [
    ...(maintenance?.slice(0, 5).map((m) => ({
      id: m.id,
      type: 'maintenance',
      title: `${m.type?.replace('_', ' ')} - ${m.expand?.firearm?.name || 'Unknown'}`,
      date: m.date,
      link: '/maintenance',
    })) || []),
    ...(rangeTrips?.slice(0, 5).map((t) => ({
      id: t.id,
      type: 'range',
      title: t.location,
      date: t.date,
      link: `/range-trips/${t.id}`,
    })) || []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

  const getIcon = (type) => {
    if (type === 'maintenance') {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
      </CardHeader>
      <CardBody>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <Link key={`${activity.type}-${activity.id}`} to={activity.link} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {getIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate capitalize">{activity.title}</p>
                  <p className="text-xs text-gray-500">{format(new Date(activity.date), 'MMM d, yyyy')}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        )}
      </CardBody>
    </Card>
  )
}
