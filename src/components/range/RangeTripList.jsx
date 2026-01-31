import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useRangeTrips } from '../../hooks/useRangeTrips'
import Card, { CardBody } from '../common/Card'
import SearchBar from '../common/SearchBar'

export default function RangeTripList() {
  const [search, setSearch] = useState('')
  const { data: trips, isLoading, error } = useRangeTrips()

  const filteredTrips = useMemo(() => {
    if (!trips) return []
    return trips.filter((trip) => {
      return !search ||
        trip.location?.toLowerCase().includes(search.toLowerCase()) ||
        trip.notes?.toLowerCase().includes(search.toLowerCase())
    })
  }, [trips, search])

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (error) return <div className="text-center py-12 text-red-500">Failed to load range trips.</div>

  return (
    <div className="space-y-4">
      <div className="flex-1">
        <SearchBar value={search} onChange={setSearch} placeholder="Search trips..." />
      </div>

      <p className="text-sm text-gray-500">{filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}</p>

      {filteredTrips.length > 0 ? (
        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <Link key={trip.id} to={`/range-trips/${trip.id}`}>
              <Card hover className="cursor-pointer">
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{trip.location}</span>
                        <span className="text-sm text-gray-500">{format(new Date(trip.date), 'MMM d, yyyy')}</span>
                      </div>
                      {trip.expand?.firearms_used?.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {trip.expand.firearms_used.map((f) => f.name).join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {trip.duration && <span>{trip.duration}h</span>}
                        {trip.weather && <span>{trip.weather}</span>}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">{search ? 'No trips match your search' : 'No range trips yet.'}</div>
      )}
    </div>
  )
}
