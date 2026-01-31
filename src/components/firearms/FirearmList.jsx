import { useState, useMemo } from 'react'
import { useFirearms } from '../../hooks/useFirearms'
import FirearmCard from './FirearmCard'
import SearchBar from '../common/SearchBar'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'handgun', label: 'Handgun' },
  { value: 'rifle', label: 'Rifle' },
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'stored', label: 'Stored' },
  { value: 'repair', label: 'In Repair' },
  { value: 'sold', label: 'Sold' },
]

export default function FirearmList() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: firearms, isLoading, error } = useFirearms()

  const filteredFirearms = useMemo(() => {
    if (!firearms) return []

    return firearms.filter((firearm) => {
      const matchesSearch =
        !search ||
        firearm.name?.toLowerCase().includes(search.toLowerCase()) ||
        firearm.make?.toLowerCase().includes(search.toLowerCase()) ||
        firearm.model?.toLowerCase().includes(search.toLowerCase()) ||
        firearm.caliber?.toLowerCase().includes(search.toLowerCase()) ||
        firearm.serial_number?.toLowerCase().includes(search.toLowerCase())

      const matchesType = !typeFilter || firearm.type === typeFilter
      const matchesStatus = !statusFilter || firearm.status === statusFilter

      return matchesSearch && matchesType && matchesStatus
    })
  }, [firearms, search, typeFilter, statusFilter])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load firearms. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search firearms..."
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {filteredFirearms.length} firearm{filteredFirearms.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filteredFirearms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFirearms.map((firearm) => (
            <FirearmCard key={firearm.id} firearm={firearm} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {search || typeFilter || statusFilter
            ? 'No firearms match your filters'
            : 'No firearms yet. Add your first firearm!'}
        </div>
      )}
    </div>
  )
}
